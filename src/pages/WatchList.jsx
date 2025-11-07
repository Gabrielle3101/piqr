import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Chatbot from '../components/Chatbot';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/Watchlist.css';
import { removeMovieFromFavorites } from '../firebaseUtils';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useTheme from '../hooks/useTheme';

function WatchList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedMovies, setSavedMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleRemove = async (movieToRemove) => {
    if (!user) return;
  
    try {
      await removeMovieFromFavorites(user.uid, movieToRemove);
      setSavedMovies(prev => prev.filter(m => m.id !== movieToRemove.id));
      toast.success("Movie removed successfully")
    } catch (err) {
      console.error("Error removing movie:", err);
      toast.error("Failed to remove movie.");
    }
  };

  const theme = useTheme();

  const isLightMode = ['light', 'pinkgummy', 'sunset'].includes(theme);
    
  const iconPath = isLightMode ? '/assets/icons/light/' : '/assets/icons/';
  const imgPath = isLightMode ? '/assets/img/light/' : '/assets/img/';

  useEffect(() => {
    const fetchSavedMovies = async () => {
      if (!user) return;
  
      setLoading(true);
      try {
        const userRef = doc(db, 'users', user.uid);
        const snapshot = await getDoc(userRef);
  
        if (snapshot.exists()) {
          const data = snapshot.data();
          setSavedMovies(data.savedMovies || []);
        }
      } catch (err) {
        console.error("Error fetching saved movies:", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchSavedMovies();
  }, [user]);

  return (
    <div className="page">
      <Sidebar />
      <div className="watchlist">
        <div className="header-row">
          <h1>My Watchlist</h1>
          {savedMovies.length > 0 &&
            <button className="primary-btn" onClick={() => navigate('/movie')}>
              Discover movies
            </button>
          }
        </div>
        {savedMovies.length > 0 && (
          <p className="placeholder">{savedMovies.length} movies saved</p>
        )}

        {loading ? (
          <div className="fav-cards">
            {[...Array(3)].map((_, i) => (
              <div className="fav-card skeleton" key={i}>
                <div className="image-wrapper skeleton-box" />
                <div className="genre-tag skeleton-text" />
                <div className="movie-title skeleton-text" />
                <div className="meta-info skeleton-text" />
                <div className="card-details">
                  <p className="overview skeleton-text" />
                  <button className="primary-btn red skeleton-btn" disabled />
                </div>
              </div>
            ))}
          </div>
        ) : savedMovies.length > 0 ? (
          <div className="fav-cards">
            {savedMovies.map((movie, index) => (
              <div className="fav-card" key={index} onClick={() => navigate(`/moviedetail/${movie.id}`)}>
                <div className="image-wrapper">
                  <img
                    src={
                      movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : '/assets/img/movie-placeholder.png'
                    }
                    alt={movie.title}
                  />
                  <div className="genre-tag">{movie.genre || 'No genre found'}</div>
                  <div className="movie-title">{movie.title}</div>
                  <div className="meta-info">
                    <span>
                      <img src="/assets/icons/today.svg" alt="" className="icon" />
                      {movie.release_date?.slice(0, 4)}
                    </span>
                    <span>
                      <img src="/assets/icons/schedule.svg" alt="" className="icon" />
                      {movie.runtime ? `${movie.runtime} min` : '—'}
                    </span>
                    <span>
                      <img src="/assets/icons/star.svg" alt="" className="icon" />
                      {movie.vote_average?.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="card-details">
                  <p className="overview">
                    {movie.overview?.length > 120
                      ? movie.overview.slice(0, 70) + '...'
                      : movie.overview || 'No description available.'}
                  </p>
                  <button
                    className="primary-btn red"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(movie);
                    }}
                  >
                    <img src={`${iconPath}delete.svg`} alt="" className="icon" />
                    Remove from watchlist
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="none-saved">
            <img src={`${imgPath}watchlist.svg`} alt="" />
            <h4>Your watchlist is empty</h4>
            <p>Start liking movies to build your personal collection</p>
            <button className="primary-btn" onClick={() => navigate('/movie')}>
              Discover movies
            </button>
          </div>
        )}

        {/* {savedMovies.length > 0 ? (
          <div className="fav-cards">
            {savedMovies.map((movie, index) => (
              <div className="fav-card" key={index} onClick={() => navigate(`/moviedetail/${movie.id}`)}>
                <div className="image-wrapper">
                  <img
                    src={
                      movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : '/assets/img/movie-placeholder.png'
                    }
                    alt={movie.title}
                  />
                  <div className="genre-tag">{movie.genre || 'No genre found'}</div>
                  <div className="movie-title">{movie.title}</div>
                  <div className="meta-info">
                    <span>
                      <img src="/assets/icons/today.svg" alt="" className="icon" />
                      {movie.release_date?.slice(0, 4)}
                    </span>
                    <span>
                        <img src="/assets/icons/schedule.svg" alt="" className="icon" />
                        {movie.runtime ? `${movie.runtime} min` : '—'}
                    </span>
                    <span>
                      <img src="/assets/icons/star.svg" alt="" className="icon" />
                      {movie.vote_average?.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="card-details">
                  <p className="overview">
                    {movie.overview?.length > 120
                      ? movie.overview.slice(0, 70) + '...'
                      : movie.overview || 'No description available.'}
                  </p>
                  <button
                    className="primary-btn red"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(movie);
                    }}
                    >
                    <img src={`${iconPath}delete.svg`} alt="" className="icon" />
                    Remove from watchlist
                </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="none-saved">
            <img src={`${imgPath}watchlist.svg`} alt="" />
            <h4>Your watchlist is empty</h4>
            <p>Start liking movies to build your personal collection</p>
            <button className="primary-btn" onClick={() => navigate('/movie')}>
              Discover movies
            </button>
          </div>
        )} */}
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

export default WatchList;