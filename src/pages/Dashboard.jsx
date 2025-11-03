import React from 'react'
import { useAuth } from "../context/AuthContext";
import Chatbot from '../components/Chatbot';
import Sidebar from '../components/Sidebar';
import '../styles/Dashboard.css'
import { Link } from 'react-router-dom';
import useTheme from '../hooks/useTheme';

function Dashboard() {
  const { user } = useAuth();
  const theme = useTheme();

  const isLightMode = ['light', 'pinkgummy', 'sunset'].includes(theme);
  
  const iconPath = isLightMode ? '/assets/icons/light/' : '/assets/icons/';

  return (
    <div className='page'>
      <Sidebar />
      <div className="dashboard">
        <h1>What are you in the mood for?</h1>
        <p>Let us help you decide what to watch or eat today</p>
        <div className="options">
          <Link to='/movie'>
            <div className="img-container">
              <img src={`${iconPath}movie.svg`} alt="" />
            </div>
            <h2>Movie/Series</h2>
            <p>
            Discover picks made just for you
            </p>
          </Link>
          <Link to='/food' className='second-opt'>
            <div className="img-container">
            <img src={`${iconPath}food2.svg`} alt="" />
            </div>
            <h2>Snack/Meal</h2>
            <p>
              Find something delicious to eat
            </p>
          </Link>
          <Link to='/surprise'>
            <div className="img-container">
              <img src={`${iconPath}surprise.svg`} alt="" />
            </div>
            <h2>Surprise Me</h2>
            <p>
              Random recommendation just for you
            </p>
          </Link>
        </div>
      </div>
      
      {user && <Chatbot />}
    </div>
  );
}

export default Dashboard;

