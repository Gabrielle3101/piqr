import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Chatbot from '../components/Chatbot';
import '../styles/Profile.css';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import { updateProfile, updateEmail, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getDoc } from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useTheme from '../hooks/useTheme';

function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user.displayName || '');
  const [photo, setPhoto] = useState(user.photoURL || '');
  const [email, setEmail] = useState(user.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (email !== user.email) {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
        await updateEmail(user, email);
      }
  
      await updateProfile(user, { displayName: name });
  
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: name,
        photoURL: photo,
        email: email
      });
  
      toast.info("Profile updated!");
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };  

  const theme = useTheme();

  const isLightMode = ['light', 'pinkgummy', 'sunset'].includes(theme);

  const handleCancel = () => {
    navigate('/dashboard');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        if (data.photoURL) {
          setPhoto(data.photoURL);
        }
      }
    };
  
    fetchUserData();
  }, [user]);

  return (
    <div className="page">
      <Sidebar />
      <div className="profile">
        <div className="header-row">
          <h1>My Profile</h1>
        </div>
        <p className='placeholder'>Manage your profile settings</p>
        <div className="profile-info">
          <div className="user-info">
            <div className="user-div">
              <div className="user-img">
                {photo ? (
                  <img className='pfp' src={photo} alt="Profile" />
                ) : (
                  user.displayName?.charAt(0)
                )}
              </div>
              <p className="username">
                {user.displayName}
                <span>{user.email}</span>
              </p>
            </div>
            <label className="add-img">
              Upload new picture
              <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
            </label>
          </div>
          <hr />
          <label htmlFor="name">Full name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            id='name'
          />
          <label htmlFor="email">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            id='email'
          />
          <label htmlFor="password">Current password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password to confirm email change"
            id='password'
          />
          <hr />
          <div className="actions">
            <button className="secondary-btn" onClick={handleCancel} disabled={loading}>
              Cancel
            </button>
            <button className="primary-btn" onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
      {user && <Chatbot />}
      <ToastContainer 
        position="top-right" 
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isLightMode ? "light" : "dark"}
        toastClassName="custom-toast"
      />
    </div>
  );
}

export default Profile;