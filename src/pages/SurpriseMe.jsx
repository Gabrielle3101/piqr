import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Chatbot from '../components/Chatbot';
import { useAuth } from '../context/AuthContext';
import '../styles/SurpriseMe.css';

function SurpriseMe() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [surprise, setSurprise] = useState(null);
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchSurprise = async (chosenType) => {
    setType(chosenType);
    setLoading(true);
    setSurprise(null);

    try {
      if (chosenType === 'movie') {
        const apiKey = '0185a0ad03a3db2ef4d9c66936a54152';
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`
        );
        const data = await response.json();
        const randomMovie = data.results[Math.floor(Math.random() * data.results.length)];
        setSurprise(randomMovie);
      } else {
        const response = await fetch(
          `http://localhost:5000/api/recipes?q=random&mealType=Lunch&to=10`
        );
        const data = await response.json();
        const randomRecipe = data.hits[Math.floor(Math.random() * data.hits.length)];
        setSurprise(randomRecipe.recipe);
      }
    } catch (err) {
      console.error('Error fetching surprise:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = () => {
    if (type === 'movie') {
      navigate(`/moviedetail/${surprise.id}`);
    } else {
      navigate(`/fooddetail/${encodeURIComponent(surprise.uri)}`, {
        state: {
          recipe: surprise,
          prepType: 'Surprise',
          selectedTime: 'Anytime',
          selectedType: 'Random',
          spiceLevel: 'Unknown'
        }
      });
    }
  };

  return (
    <div className="page">
      <Sidebar />
      <div className="surprise">
        <div className="header-row">
          <h1>Surprise Me</h1>
        </div>
        <p className="placeholder">Choose what kind of surprise you want</p>

        {!type && (
          <div className="choice-buttons">
            <button className="primary-btn" onClick={() => fetchSurprise('movie')}>
              🎬 Surprise Me with a Movie
            </button>
            <button className="primary-btn" onClick={() => fetchSurprise('recipe')}>
              🍽️ Surprise Me with a Recipe
            </button>
          </div>
        )}

        {loading && <p className="loading">Fetching something fun for you...</p>}

        {surprise && (
          <div className="surprise-card">
            <div className="image-wrapper">
              <img
                src={
                  type === 'movie'
                    ? `https://image.tmdb.org/t/p/w500${surprise.poster_path}`
                    : surprise.image
                }
                alt={type === 'movie' ? surprise.title : surprise.label}
              />
            </div>
            <h2>{type === 'movie' ? surprise.title : surprise.label}</h2>
            <p className="overview">
              {type === 'movie'
                ? surprise.overview?.slice(0, 120) + '...'
                : surprise.source || 'No description available.'}
            </p>
            <div className="action-row">
              <button className="secondary-btn" onClick={() => fetchSurprise(type)}>
                Try Again
              </button>
              <button className="primary-btn" onClick={handleView}>
                View Details →
              </button>
            </div>
          </div>
        )}
      </div>
      {user && <Chatbot />}
    </div>
  );
}

export default SurpriseMe;