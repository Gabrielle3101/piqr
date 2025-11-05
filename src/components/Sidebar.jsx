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
    
    const isLightMode = ['light', 'pinkgummy', 'sunset'].some(theme =>
        document.body.classList.contains(theme)
    );      
    
    const iconPath = isLightMode ? '/assets/icons/light/' : '/assets/icons/';
    const imgPath = isLightMode ? '/assets/img/light/' : '/assets/img/';

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

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.className = savedTheme;
        }
    }, []);
    
    const setTheme = (theme) => {
        document.body.className = theme;
        localStorage.setItem('theme', theme);
    };      

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
                    <div className="theme-selector">
                        <img src={`${iconPath}bulb.svg`} alt="" className="icon" />
                        <select onChange={(e) => setTheme(e.target.value)} defaultValue={localStorage.getItem('theme') || 'light'}>
                        <option value="light">Light Mode</option>
                        <option value="dark">Dark Mode</option>
                        <option value="sunset">Sunset</option>
                        <option value="neon">Neon</option>
                        <option value="bloodred">Blood Red</option>
                        <option value="pinkgummy">Pink Gummy</option>
                        </select>
                    </div>
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
