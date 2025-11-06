import React, { useState, useEffect } from 'react'
import { useAuth } from "../context/AuthContext";
import '../styles/Sidebar.css'
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

function Sidebar() {
    const [photoURL, setPhotoURL] = useState('');
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/')
    }

    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved === 'dark';
    });

    useEffect(() => {
        const theme = isDarkMode ? 'dark' : 'light';
        document.body.className = theme;
        localStorage.setItem('theme', theme);
    }, [isDarkMode]);

    const iconPath = isDarkMode ? '/assets/icons/' : '/assets/icons/light/';
    const imgPath = isDarkMode ? '/assets/img/' : '/assets/img/light/';

    useEffect(() => {
        const fetchPhoto = async () => {
            if (user) {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    if (data.photoURL) {
                        setPhotoURL(data.photoURL);
                    }
                }
            }
        };
        fetchPhoto();
    }, [user]);

    return (
        <div className="sidebar">
            <div className="logo">
                <img src={`${imgPath}logo.png`} alt="" />
                <h2>Piqr</h2>
            </div>

            <div className="page-links">
                <Link to='/dashboard' className={location.pathname === '/dashboard' ? 'active' : ''}>
                    <img src={`${iconPath}home.svg`} alt="" className="icon" /> Home
                </Link>
                <Link to='/watchlist' className={location.pathname === '/watchlist' ? 'active' : ''}>
                    <img src={`${iconPath}favorite.svg`} alt="" className="icon" />Watchlist
                </Link>
                <Link to='/recipes' className={location.pathname === '/recipes' ? 'active' : ''}>
                    <img src={`${iconPath}food.svg`} alt="" className="icon" />Cookbook
                </Link>
                <Link to='/user' className={location.pathname === '/user' ? 'active' : ''}>
                    <img src={`${iconPath}User.svg`} alt="" className="icon" />Profile
                </Link>
            </div>

            <div className="bottom-options">
                {user && (
                    <button onClick={handleLogout}>
                        <img src={`${iconPath}logout.svg`} alt="" className="icon" />
                        Log out
                    </button>
                )}
                <button onClick={() => setIsDarkMode(prev => !prev)}>
                    <img src={`${iconPath}bulb.svg`} alt="" className="icon" />
                    Switch Theme
                </button>
            </div>

            <div className="sidebar-bottom">
                <div className="open-bottom-options">
                    <div className="user-img">
                        {photoURL ? (
                            <img src={photoURL} alt="Profile" className="pfp" />
                        ) : (
                            user?.displayName?.charAt(0).toUpperCase() || "G"
                        )}
                    </div>
                    <span>{user?.displayName || "Guest"}</span>
                </div>
            </div>
        </div>
    )
}

export default Sidebar