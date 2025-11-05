import Sidebar from '../components/Sidebar'
// import { useAuth } from "../context/AuthContext";
import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Chatbot from '../components/Chatbot';
import { useAuth } from "../context/AuthContext";
import '../styles/MovieDetail.css'
import { addMovieToFavorites } from '../firebaseUtils';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useTheme from '../hooks/useTheme';

function MovieDetail() {
    const { user } = useAuth();
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [credits, setCredits] = useState(null);

    const theme = useTheme();

    const isLightMode = ['light', 'pinkgummy', 'sunset'].includes(theme);

    const handleAddToFavorites = async () => {
        if (!user) {
            toast.info("Please log in to save items.");
            return;
        }
      
        try {
          await addMovieToFavorites(user.uid, {
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            release_date: movie.release_date,
            vote_average: movie.vote_average,
            overview: movie.overview,
            genre: movie.genres.map(g => g.name).join(', '),
            runtime: movie.runtime
          });
          toast.success("Movie added to your Watchlist!");
        } catch (err) {
          console.error("Error saving movie:", err);
          toast.error("Failed to save movie.");
        }
      };         
  
    useEffect(() => {
      const apiKey = '0185a0ad03a3db2ef4d9c66936a54152';
  
      async function fetchDetails() {
        const [movieRes, creditsRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`).then(res => res.json()),
          fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${apiKey}`).then(res => res.json())
        ]);
        setMovie(movieRes);
        setCredits(creditsRes);
      }
  
      fetchDetails();
    }, [id]);
  
    if (!movie || !credits) return <p>Loading...</p>;
  
    const director = credits.crew.find(person => person.job === 'Director');
    const cast = credits.cast.slice(0, 3);
  
    return (
        <div className='page'>
        <Sidebar />
        <div className="movie-detail">
            <div className="header-row">
                <h1>Here are your picks</h1>
            </div>
            <Link className='back' to='/movie'>🡠 Back</Link>
            <div className="columns">
            {/* Left Column */}
            <div className="left-column">
                <div className="image-wrapper">
                <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
                <div className="genre-tag">{movie.genres[0]?.name}</div>
                </div>
            </div>
    
            {/* Right Column */}
            <div className="right-column">
                <h1>{movie.title}</h1>
                <div className="meta-info2">
                <span><img src="/assets/icons/today-gray.png" alt="" className="icon" />{movie.release_date?.slice(0, 4)}</span>
                <span><img src="/assets/icons/schedule-gray.png" alt="" className="icon" />{movie.runtime} min</span>
                </div>
                <div className='rate'>
                    <span>⭐ {movie.vote_average?.toFixed(1)}/10</span>
                </div>
                <h3>Synopsis</h3>
                <p className="synopsis">{movie.overview}</p>
                <h3>Director</h3>
                <p style={{fontSize: "14px"}}>{director?.name || 'N/A'}</p>
                <h3>Cast</h3>
                <div className='cast-names'>
                    {cast.map((actor, index) => (
                        <span key={index} className='cast-name'>{actor.name}</span>
                    ))}
                </div>
                <button onClick={handleAddToFavorites} className="favorite-btn primary-btn">Add to Watchlist</button>
            </div>
            </div>
    
            {/* Additional Info */}
            <div className="additional-info">
                <h2>Additional Information</h2>
                <div className="infos">
                    <span>
                        Release year
                        <p>{movie.release_date?.slice(0, 4)}</p>
                    </span>
                    <span>
                        Genre
                        <p>{movie.genres.map(g => g.name).join(', ')}</p>
                    </span>
                    <span>
                        Run time
                        <p>{movie.runtime} min</p>
                    </span>
                    <span>
                        Rating
                        <p>⭐ {movie.vote_average?.toFixed(1)}/10</p>
                    </span>
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

export default MovieDetail
