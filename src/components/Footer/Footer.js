import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <Container fluid>
        <Row>
          
          <Col xs={3} className="footer-col">
            <img src="./logo.png" alt= "Logo" className="logo" />
          </Col>
          <Col xs={3} className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/mint">Mint</a>
              </li>
              <li>
                <a href="/batch-mint">Batch Mint</a>
              </li>
            </ul>
          </Col>
          <Col xs={3} className="footer-col">
            <h4>Follow Us</h4>
            <ul className="list-inline">
              <li className="list-inline-item">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
              </li>
              <li className="list-inline-item">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  Twitter
                </a>
              </li>
              <li className="list-inline-item">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </li>
            </ul>
          </Col>
          <Col xs={3} className="footer-col">
            <h4>SGB/FLR Community</h4>
            <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
