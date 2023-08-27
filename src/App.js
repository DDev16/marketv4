// App.js
import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Web3Provider from './utils/Web3Provider';
import UserContext from './utils/userContext.js';
import BatchMint from './components/Batch/BatchMinting';
import NavBar from './components/Nav/NavBar';
import Mint from './components/Mint/Mint';
import MyTokens from './components/MyNFTs/MyTokens';
import Home from './components/Home/Home';
import Footer from './components/Footer/Footer.js';
import TokenList from './components/Wallet/TokenList.js';
import MarketList from './components/Marketplace/Listing.js';
import MarketListings from './components/Marketplace/MarketListings/MarketListings.js';

import ProfileSettings from './components/Profile/Settings/ProfileSettings.js';
import SignIn from './components/Profile/SignIn';
import UserDashboard from './components/Profile/Dashboard/UserDashboard';
import './App.css';
import CreateCollection from './components/Marketplace/Collection/CreateCollection';
import MyCollections from './components/Marketplace/Collection/MyCollections.js'
import AddToCollection from './components/Marketplace/Collection/AddToCollection';
import CollectionPage from './components/Marketplace/Collection/CollectionPage';
import AllCollections from './components/Marketplace/Collection/GetAllCollections';
import Auction from './components/Marketplace/Auction/Auction';
import CreateAuction from './components/Marketplace/Auction/Auction';
import SwapMeet from './components/Marketplace/Auction/SwapMeet';
import CourseCard from './components/courses/CourseCard';
import Gaming from './components/Gaming/Gaming';
import MyAuctions from './components/Marketplace/Auction/MyAuctions/MyAuctions';
import AllAuctions from './components/Marketplace/Auction/GetAllAuctions';
import Hot from './components/Marketplace/Collection/Hot/HottestCollections';
import Countdown from './components/Countdown/Countdown'; // Import the Countdown component

function App() {
  const [user, setUser] = useState(null);
  const [isAppReleased, setIsAppReleased] = useState(false);
  
  // Wrap launchReleaseDate in useMemo to prevent it from changing on every render
  const launchReleaseDate = useMemo(() => new Date('2023-08-15T12:00:00Z'), []);

  useEffect(() => {
    const now = new Date();
    if (now >= launchReleaseDate) {
      setIsAppReleased(true);
    }
  }, [launchReleaseDate]);

  return (
    <UserContext.Provider value={user}>
      <Web3Provider>
        <Router>
          <NavBar />
          <div className="content-wrapper">
            <div className="dashboard-wrapper">
              <UserDashboard user={user} signOutUser={() => setUser(null)} />
              <div className="content">
                {isAppReleased ? (
                  <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/mint" element={<Mint />} />
                  <Route path="/batch-mint" element={<BatchMint />} />
                  <Route path="/my-tokens" element={<MyTokens />} />
                  <Route path="/token-list" element={<TokenList />} />
                  <Route path="/marketplace" element={<MarketList />} />
                  <Route path="/marketListings" element={<MarketListings />} />
                  <Route path="/hottest-collections" element={<Hot />} />

                  <Route path="/create-collection" element={<CreateCollection />} />
                  <Route path="/my-collections" element={<MyCollections />} />
                  <Route path="/my-auctions" element={<MyAuctions />} />
                  <Route path="/all-auctions" element={<AllAuctions />} />

                  <Route path="/all-collections" element={<AllCollections />} />
                  <Route path="/swap-meet" element={<SwapMeet/>} />
                  <Route path="/add-to-collection" element={<AddToCollection />} />
                  <Route path="/collections/:collectionId" element={<CollectionPage />} />
                  <Route path="/auction" element={<Auction />} />
                  <Route path="/create-auction" element={<CreateAuction />} />
                  <Route path="/learning" element={<CourseCard />} />
                  <Route path="/gaming" element={<Gaming />} />
                  <Route path="/profile-settings" element={<ProfileSettings />} />
                  <Route path="/sign-in" element={<SignIn setUser={setUser} />} />
                  </Routes>
               ) : (
                <Countdown launchReleaseDate={launchReleaseDate} /> 
              )}
            </div>
                  
                
              
               
           
          </div>
          </div>
          <Footer />
        </Router>
      </Web3Provider>
    </UserContext.Provider>
  );
}

export default App;
