// App.js
import React from 'react';
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
import ProfileSettings from './components/Profile/Settings/ProfileSettings.js';
import SignIn from './components/Profile/SignIn';
import UserDashboard from './components/Profile/Dashboard/UserDashboard';
import './App.css';
import CreateCollection from './components/Marketplace/Collection/CreateCollection';
import MyCollections from './components/Marketplace/Collection/MyCollections.js'
import AddToCollection from './components/Marketplace/Collection/AddToCollection';
import CollectionPage from './components/Marketplace/Collection/CollectionPage';
function App() {
  const [user, setUser] = React.useState(null);

  return (
    <UserContext.Provider value={user}>
      <Web3Provider>
        <Router>
          <NavBar />
          <div className="content-wrapper">
            <div className="dashboard-wrapper">
              <UserDashboard user={user} signOutUser={() => setUser(null)} />
              <div className="content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/mint" element={<Mint />} />
                  <Route path="/batch-mint" element={<BatchMint />} />
                  <Route path="/my-tokens" element={<MyTokens />} />
                  <Route path="/token-list" element={<TokenList />} />
                  <Route path="/marketplace" element={<MarketList />} />
                  <Route path="/create-collection" element={<CreateCollection />} />
                  <Route path="/my-collections" element={<MyCollections />} />
                  <Route path="/add-to-collection" element={<AddToCollection />} />
                  <Route path="/collections/:collectionId" element={<CollectionPage />} />

                  <Route path="/profile-settings" element={<ProfileSettings />} />
                  <Route path="/sign-in" element={<SignIn setUser={setUser} />} />
                </Routes>
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
