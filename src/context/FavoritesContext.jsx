import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
    const { user } = useAuth();

    const [favorites, setFavorites] = useState({
        foods: [],
        movies: []
    });

    useEffect(() => {
        if (user) {
        const stored = localStorage.getItem(`favorites_${user.uid}`);
        if (stored) {
            setFavorites(JSON.parse(stored));
        } else {
            setFavorites({ foods: [], movies: [] });
        }
        }
    }, [user]);

    useEffect(() => {
        if (user) {
        localStorage.setItem(`favorites_${user.uid}`, JSON.stringify(favorites));
        }
    }, [favorites, user]);

    const addFavorite = (type, item) => {
        setFavorites((prev) => ({
        ...prev,
        [type]: [...prev[type], item],
        }));
    };

    const removeFavorite = (type, id) => {
        setFavorites((prev) => ({
        ...prev,
        [type]: prev[type].filter((f) => f.id !== id),
        }));
    };

    const isFavorite = (type, id) => {
        return favorites[type]?.some((f) => f.id === id);
    };

    const value = {
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
    };

    return (
        <FavoritesContext.Provider value={value}>
        {children}
        </FavoritesContext.Provider>
    );
};
