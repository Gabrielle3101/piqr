import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Chatbot from '../components/Chatbot';
import { useAuth } from "../context/AuthContext";
import '../styles/MovieList.css';
import { addMovieToFavorites } from '../firebaseUtils';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useTheme from '../hooks/useTheme';

const genreMap = {
  Action: 28,
  Comedy: 35,
  Drama: 18,
  Thriller: 53,
  Romance: 10749,
  'Sci-Fi': 878,
};

const decadeMap = {
  '1990s': { start: '1990-01-01', end: '1999-12-31' },
  '2000s': { start: '2000-01-01', end: '2009-12-31' },
  '2010s': { start: '2010-01-01', end: '2019-12-31' },
  '2020s': { start: '2020-01-01', end: '2029-12-31' },
};

function MovieList() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { genre, year } = location.state || {};
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedMovies, setLikedMovies] = useState([]);

  const theme = useTheme();
  const isLightMode = ['light', 'pinkgummy', 'sunset'].includes(theme);
  const iconPath = isLightMode ? '/assets/icons/light/' : '/assets/icons/';

  const handleLike = async (movie) => {
    if (!user) {
      toast.info("Please log in to like movies.");
      return;
    }

    if (likedMovies.includes(movie.id)) {
      toast.info("You've already liked this movie.");
      return;
    }

    try {
      await addMovieToFavorites(user.uid, movie);
      toast.success("Movie added to your Watchlist!");
      setLikedMovies((prev) => [...prev, movie.id]);
    } catch (err) {
      console.error("Error saving movie:", err);
      toast.error("Failed to save movie.");
    }
  };

  const handleShare = async (movieId) => {
    const url = `${window.location.origin}/moviedetail/${movieId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this movie!',
          url,
        });
      } catch (err) {
        console.error('Share failed:', err);
        toast.error("Sharing failed.");
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      } catch (err) {
        console.error("Clipboard copy failed:", err);
        toast.error("Failed to copy link.");
      }
    }
  };

  const fetchMovies = async () => {
    setLoading(true);
    const apiKey = '0185a0ad03a3db2ef4d9c66936a54152';
    const genreId = genreMap[genre];
    const decade = decadeMap[year];

    if (!genreId || !decade) return;

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&primary_release_date.gte=${decade.start}&primary_release_date.lte=${decade.end}&include_adult=false`
      );
      const data = await response.json();
      const shuffled = data.results.sort(() => 0.5 - Math.random());
      setMovies(shuffled.slice(0, 4));
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (genre && year) fetchMovies();
  }, [genre, year]);

  return (
    <div className='page'>
      <Sidebar />
      <div className="movie">
        <div className="header-row">
          <h1>Here are your picks</h1>
          <button className="refresh-btn" onClick={fetchMovies}>
            Refresh <img src={`${iconPath}refresh.svg`} alt="" className="icon" />
          </button>
        </div>
        <Link to='/movie'>🡠 Back</Link>

        <div className="card-grid">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div className="card-wrapper skeleton" key={i}>
                <div className="card">
                  <div className="image-wrapper skeleton-box" />
                  <div className="genre-tag skeleton-text" />
                  <div className="movie-title skeleton-text" />
                  <div className="meta-info skeleton-text" />
                  <div className="card-details">
                    <p className="overview skeleton-text" />
                    <p className="click-info skeleton-text" />
                  </div>
                </div>
                <div className="action-buttons outside">
                  <button className="like-btn skeleton-btn" disabled></button>
                  <button className="share-btn skeleton-btn" disabled></button>
                </div>
              </div>
            ))
          ) : movies.length > 0 ? (
            movies.map((movie) => (
              <div className="card-wrapper" key={movie.id}>
                <div className="card" onClick={() => navigate(`/moviedetail/${movie.id}`)}>
                  <div className="image-wrapper">
                    <img
                      src={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                          : '/assets/icons/movie-placeholder.png'
                      }
                      alt={movie.title}
                    />
                    <div className="genre-tag">{genre}</div>
                    <div className="movie-title">{movie.title}</div>
                    <div className="meta-info">
                      <span><img src="/assets/icons/today.svg" alt="" className="icon" />{movie.release_date?.slice(0, 4)}</span>
                      <span>{movie.runtime ? `${movie.runtime} min` : '—'}</span>
                      <span><img src="/assets/icons/star.svg" alt="" className="icon" /> {movie.vote_average?.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="card-details">
                    <p className="overview">
                      {movie.overview?.length > 120
                        ? movie.overview.slice(0, 120) + '...'
                        : movie.overview || 'No description available.'}
                    </p>
                    <p className="click-info">
                      <img src={`${iconPath}info.svg`} alt="" className="icon" />
                      Click card for detail view
                    </p>
                  </div>
                </div>

                <div className="action-buttons outside">
                  <button className="like-btn" onClick={() => handleLike(movie)}>
                    <img src={`${iconPath}favorite.svg`} alt="" className="icon" /> {likedMovies.includes(movie.id) ? "Liked" : "Like"}
                  </button>
                  <button className="share-btn" onClick={() => handleShare(movie.id)}>
                    <img src={`${iconPath}share.svg`} alt="" className="icon" /> Share
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-results">No movies found for your selection.</p>
          )}
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

export default MovieList;