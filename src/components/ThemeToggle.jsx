import React, { useEffect, useState } from 'react';
import '../styles/ThemeToggle.css';

function ThemeToggle() {
    const [isLight, setIsLight] = useState(() => {
        return localStorage.getItem('theme') === 'light';
    });    

    useEffect(() => {
        document.body.classList.toggle('light', isLight);
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    }, [isLight]);    

    const handleToggle = () => {
        setIsLight(prev => !prev);
    };

    return (
        <div className="theme-toggle" onClick={handleToggle} title="Switch theme">
            <img src="/assets/icons/bulb.svg" alt="Toggle theme" />
        </div>
    );
}

export default ThemeToggle;