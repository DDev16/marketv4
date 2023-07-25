import '../../../components/Profile/Settings/ProfileSettings.js'; // Import the CSS file for styling
import '../../../components/Profile/Settings/ProfileSettings.css'
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../../utils/Firebase.js'; // Update the path if needed

const Profile = () => {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [facebook, setFacebook] = useState('');
  const [twitter, setTwitter] = useState('');
  const [telegram, setTelegram] = useState('');
  const [instagram, setInstagram] = useState('');
  const [soundcloud, setSoundcloud] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user data from Firestore
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDisplayName(data.displayName || '');
          setUsername(data.username || '');
          setEmail(data.email || '');
          setBio(data.bio || '');
          setWebsite(data.website || '');
          setFacebook(data.social?.facebook || '');
          setTwitter(data.social?.twitter || '');
          setTelegram(data.social?.telegram || '');
          setInstagram(data.social?.instagram || '');
          setSoundcloud(data.social?.soundcloud || '');
          setWalletAddress(data.walletAddress || '');
          setProfileImage(data.profileImage || null);
        }
      }
    });
  
    return () => unsubscribe();
  }, [auth, db])


  const handleDisplayNameChange = (e) => {
    setDisplayName(e.target.value);
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleBioChange = (e) => {
    setBio(e.target.value);
  };

  const handleWebsiteChange = (e) => {
    setWebsite(e.target.value);
  };

  const handleFacebookChange = (e) => {
    setFacebook(e.target.value);
  };

  const handleTwitterChange = (e) => {
    setTwitter(e.target.value);
  };

  const handleTelegramChange = (e) => {
    setTelegram(e.target.value);
  };

 

  const handleInstagramChange = (e) => {
    setInstagram(e.target.value);
  };

  const handleSoundcloudChange = (e) => {
    setSoundcloud(e.target.value);
  };

 
  const handleWalletAddressChange = (e) => {
    setWalletAddress(e.target.value);
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
  };

  const handleUpdateProfile = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;
        let imageUrl = '';
  
        // Upload profile image if selected
        if (profileImage) {
          const storageRef = ref(storage, `profileImages/${userId}`);
          const snapshot = await uploadBytesResumable(storageRef, profileImage);
          imageUrl = await getDownloadURL(snapshot.ref);
        }
  
        const profileData = {
          displayName,
          username,
          email,
          bio,
          website,
          social: {
            facebook,
            twitter,
            telegram,
            instagram,
            soundcloud,
            
          },
          walletAddress,
          profileImage: imageUrl, // Save the URL of the image here
        };
  
        const userRef = doc(db, 'users', userId);
        console.log(profileData);

        await setDoc(userRef, profileData, { merge: true });
  
        console.log('Profile updated!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };
  

  return (
    <div className="profile-container">
      <h2>Profile settings</h2>
      <img src={profileImage} alt="Profile" />

      <div className="form-group">
        <label htmlFor="display-name">Display Name:</label>
        <input type="text" id="display-name" value={displayName} onChange={handleDisplayNameChange} />
      </div>
      <div className="form-group">
        <label htmlFor="username">Username:</label>
        <input type="text" id="username" value={username} onChange={handleUsernameChange} />
      </div>
      <div className="form-group">
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" value={email} onChange={handleEmailChange} />
      </div>
      <div className="form-group">
        <label htmlFor="bio">Bio:</label>
        <textarea id="bio" value={bio} onChange={handleBioChange} />
      </div>
      <div className="form-group">
        <label htmlFor="website">Website:</label>
        <input type="text" id="website" value={website} onChange={handleWebsiteChange} />
      </div>
      <div className="form-group">
        <label htmlFor="facebook">Facebook:</label>
        <input type="text" id="facebook" value={facebook} onChange={handleFacebookChange} />
      </div>
      <div className="form-group">
        <label htmlFor="twitter">Twitter:</label>
        <input type="text" id="twitter" value={twitter} onChange={handleTwitterChange} />
      </div>
      <div className="form-group">
        <label htmlFor="telegram">Telegram:</label>
        <input type="text" id="telegram" value={telegram} onChange={handleTelegramChange} />
      </div>
      
      <div className="form-group">
        <label htmlFor="instagram">Instagram:</label>
        <input type="text" id="instagram" value={instagram} onChange={handleInstagramChange} />
      </div>
      <div className="form-group">
        <label htmlFor="soundcloud">Soundcloud:</label>
        <input type="text" id="soundcloud" value={soundcloud} onChange={handleSoundcloudChange} />
      </div>
      
      <div className="form-group">
        <label htmlFor="wallet-address">Wallet Address:</label>
        <input type="text" id="wallet-address" value={walletAddress} onChange={handleWalletAddressChange} />
      </div>
      <input type="file" onChange={handleProfileImageChange} />
      <button className="update-btn" onClick={handleUpdateProfile}>
        Update profile
      </button>    
    </div>
  );
};

export default Profile;
