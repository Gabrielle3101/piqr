import React, { useState } from 'react';
import '../styles/Movie.css';
import '../styles/Dashboard.css';
import Sidebar from '../components/Sidebar';
import { useAuth } from "../context/AuthContext";
import Chatbot from '../components/Chatbot';
import { Link, useNavigate } from 'react-router-dom';

function CustomDropdown({ label, options, selected, setSelected }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="dropdown">
      <label>{label}</label>
      <div className="dropdown-header" onClick={() => setIsOpen(!isOpen)}>
        {selected || `Choose an option...`}
        <span className="arrow">{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && (
        <ul className="dropdown-list">
          {options.map((opt) => (
            <li key={opt} onClick={() => { setSelected(opt); setIsOpen(false); }}>
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const isLightMode = document.body.classList.contains('light');
    
const iconPath = isLightMode ? '/assets/icons/light/' : '/assets/icons/';

function Movie() {
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedYear && selectedGenre) {
      navigate('/movielist', {
        state: {
          year: selectedYear,
          genre: selectedGenre
        }
      });
    } else {
      alert('Please select both year and genre');
    }
  };

  return (
    <div className='page'>
      <Sidebar />
      <div className="movie">
        <h1>What are you in the mood for?</h1>
        <Link to='/dashboard'>← Back</Link>

        <div className="movie-options">
          <h2>
            <img className='icon' src={`${iconPath}movie.svg`} alt="Movie Icon" />
            Get Movie/Series Recommendation
          </h2>

          <form onSubmit={handleSubmit}>
            <CustomDropdown
              label="Select year"
              options={['1990s', '2000s', '2010s', '2020s']}
              selected={selectedYear}
              setSelected={setSelectedYear}
            />

            <CustomDropdown
              label="Select genre"
              options={['Action', 'Comedy', 'Drama', 'Thriller', 'Romance', 'Sci-Fi']}
              selected={selectedGenre}
              setSelected={setSelectedGenre}
            />

            <input type="submit" className="primary-btn" value="Get Recommendation" />
          </form>
        </div>
      </div>

      {user && <Chatbot />}
    </div>
  );
}

export default Movie;