// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

contract TimeCapsule {
    address public owner;
    uint256 public lockTime;

    // Maps user address to token balance for ERC20 tokens
    mapping(address => mapping(IERC20 => uint256)) public userERC20Balances;

    // Maps user address to a map of token IDs for ERC721 tokens
    mapping(address => mapping(IERC721 => uint256[])) public userERC721Tokens;

    // Maps user address to a map of token IDs and balances for ERC1155 tokens
    mapping(address => mapping(IERC1155 => mapping(uint256 => uint256))) public userERC1155Balances;

    constructor(uint256 _lockTime) {
        owner = msg.sender;
        lockTime = _lockTime;
    }

    modifier unlocked() {
        require(block.timestamp >= lockTime, "The time lock has not yet expired.");
        _;
    }

    function depositERC20(IERC20 token, uint256 amount) public {
        require(token.transferFrom(msg.sender, address(this), amount), "ERC20 transfer failed.");
        userERC20Balances[msg.sender][token] += amount;
    }

    function withdrawERC20(IERC20 token) public unlocked {
        uint256 amount = userERC20Balances[msg.sender][token];
        require(token.transfer(msg.sender, amount), "ERC20 withdrawal failed.");
        userERC20Balances[msg.sender][token] = 0;
    }

    function depositERC721(IERC721 token, uint256 tokenId) public {
        token.safeTransferFrom(msg.sender, address(this), tokenId);
        userERC721Tokens[msg.sender][token].push(tokenId);
    }

    function withdrawERC721(IERC721 token, uint256 tokenId) public unlocked {
        require(_popTokenId(msg.sender, token, tokenId), "Token ID not found for this user.");
        token.safeTransferFrom(address(this), msg.sender, tokenId);
    }

    function depositERC1155(IERC1155 token, uint256 id, uint256 amount, bytes memory data) public {
        token.safeTransferFrom(msg.sender, address(this), id, amount, data);
        userERC1155Balances[msg.sender][token][id] += amount;
    }

    function withdrawERC1155(IERC1155 token, uint256 id, uint256 amount, bytes memory data) public unlocked {
        require(userERC1155Balances[msg.sender][token][id] >= amount, "Not enough token balance.");
        userERC1155Balances[msg.sender][token][id] -= amount;
        token.safeTransferFrom(address(this), msg.sender, id, amount, data);
    }

    function _popTokenId(address user, IERC721 token, uint256 tokenId) private returns (bool) {
        uint256[] storage tokenIds = userERC721Tokens[user][token];
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (tokenIds[i] == tokenId) {
                // Move the last element into the place of the one to delete
                tokenIds[i] = tokenIds[tokenIds.length - 1];
                tokenIds.pop();
                return true;
            }
        }
        return false;
    }
}
