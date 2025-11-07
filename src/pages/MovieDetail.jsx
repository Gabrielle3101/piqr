import Sidebar from '../components/Sidebar'
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
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const theme = useTheme();
    const isLightMode = ['light', 'pinkgummy', 'sunset'].includes(theme);

    const handleAddToFavorites = async () => {
        if (!user) {
            toast.info("Please log in to save items.");
            return;
        }

        if (isSaved) {
            toast.info("This movie is already in your Watchlist.");
            return;
        }

        setIsSaving(true);

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
            setIsSaved(true);
        } catch (err) {
            console.error("Error saving movie:", err);
            toast.error("Failed to save movie.");
        } finally {
            setIsSaving(false);
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

    if (!movie || !credits) {
        return (
            <div className="page">
                <Sidebar />
                <div className="movie-detail">
                <div className="header-row">
                    <h1 className="skeleton-text" style={{ width: '200px' }} />
                </div>
                <Link className="back" to="/movie">🡠 Back</Link>
                <div className="columns">
                    <div className="left-column">
                    <div className="image-wrapper skeleton-box" />
                    <div className="genre-tag skeleton-text" />
                    </div>
                    <div className="right-column">
                    <h1 className="skeleton-text" style={{ width: '60%' }} />
                    <div className="meta-info2">
                        <span className="skeleton-text" style={{ width: '80px' }} />
                        <span className="skeleton-text" style={{ width: '80px' }} />
                    </div>
                    <div className="rate skeleton-text" style={{ width: '100px' }} />
                    <h3 className="skeleton-text" style={{ width: '100px' }} />
                    <p className="synopsis skeleton-text" style={{ height: '60px' }} />
                    <h3 className="skeleton-text" style={{ width: '100px' }} />
                    <p className="skeleton-text" style={{ width: '120px' }} />
                    <h3 className="skeleton-text" style={{ width: '100px' }} />
                    <div className="cast-names">
                        {[...Array(3)].map((_, i) => (
                        <span key={i} className="cast-name skeleton-text" style={{ width: '80px' }} />
                        ))}
                    </div>
                    <button className="favorite-btn primary-btn skeleton-btn" disabled>Saving...</button>
                    </div>
                </div>
                <div className="additional-info">
                    <h2 className="skeleton-text" style={{ width: '200px' }} />
                    <div className="infos">
                    {[...Array(4)].map((_, i) => (
                        <span key={i}>
                        <p className="skeleton-text" style={{ width: '100px' }} />
                        <p className="skeleton-text" style={{ width: '150px' }} />
                        </span>
                    ))}
                    </div>
                </div>
                </div>
            </div>
        );
    }

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
                    <div className="left-column">
                        <div className="image-wrapper">
                            <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
                            <div className="genre-tag">{movie.genres[0]?.name}</div>
                        </div>
                    </div>

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
                        <p style={{ fontSize: "14px" }}>{director?.name || 'N/A'}</p>
                        <h3>Cast</h3>
                        <div className='cast-names'>
                            {cast.map((actor, index) => (
                                <span key={index} className='cast-name'>{actor.name}</span>
                            ))}
                        </div>
                        <button
                            onClick={handleAddToFavorites}
                            className="favorite-btn primary-btn"
                            disabled={isSaving || isSaved}
                        >
                            {isSaving ? "Saving..." : isSaved ? "Saved" : "Add to Watchlist"}
                        </button>
                    </div>
                </div>

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