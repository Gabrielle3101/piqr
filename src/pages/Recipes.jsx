import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Chatbot from '../components/Chatbot';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { removeRecipeFromFavorites } from '../firebaseUtils';
import '../styles/Recipes.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useTheme from '../hooks/useTheme';

function Recipes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedRecipes, setSavedRecipes] = useState([]);

  useEffect(() => {
    const fetchSavedRecipes = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, 'users', user.uid);
        const snapshot = await getDoc(userRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setSavedRecipes(data.savedFoods || []);
        }
      } catch (err) {
        console.error("Error fetching recipes:", err);
      }
    };

    fetchSavedRecipes();
  }, [user]);

  const handleRemove = async (recipeToRemove) => {
    if (!user) return;

    try {
      await removeRecipeFromFavorites(user.uid, recipeToRemove);
      setSavedRecipes(prev => prev.filter(item => item.recipe.uri !== recipeToRemove.recipe.uri));
      toast.success("Recipe removed successfully!")
    } catch (err) {
      console.error("Error removing recipe:", err);
      toast.error("Failed to remove recipe.");
    }
  };

  const theme = useTheme();

  const isLightMode = ['light', 'pinkgummy', 'sunset'].includes(theme);
    
  const iconPath = isLightMode ? '/assets/icons/light/' : '/assets/icons/';
  const imgPath = isLightMode ? '/assets/img/light/' : '/assets/img/';

  return (
    <div className="page">
      <Sidebar />
      <div className="recipes">
        <div className="header-row">
          <h1>My Recipes</h1>
          {savedRecipes.length > 0 &&
            <button className="primary-btn" onClick={() => navigate('/food')}>
              Discover foods
            </button> 
          }
        </div>
        <p className="placeholder">{savedRecipes.length} recipes saved</p>

        {savedRecipes.length > 0 ? (
          <div className="fav-cards">
            {savedRecipes.map((item, index) => {
              const { recipe: food, prepType, selectedTime, selectedType, spiceLevel } = item;
              return (
                <div
                  className="fav-card"
                  key={index}
                  onClick={() =>
                    navigate(`/fooddetail/${encodeURIComponent(food.uri)}`, {
                      state: { recipe: food, prepType, selectedTime, selectedType, spiceLevel },
                    })
                  }
                >
                  <div className="image-wrapper">
                    <img src={food.image} alt={food.label} />
                    <div className="tag top-left">{selectedType}</div>
                    <div className="tag top-right">{prepType}</div>
                    <div className="food-title">{food.label}</div>
                    <div className="meta-info">
                      <span>{selectedTime}</span>
                      <span>{spiceLevel}</span>
                      <span>
                        <img src="/assets/icons/schedule.svg" alt="" className="icon" />
                        {Math.round(food.totalTime) || '—'} min
                      </span>
                    </div>
                  </div>

                  <div className="card-details">
                    <p className="overview">
                      {food.source?.length > 120
                        ? food.source.slice(0, 120) + '...'
                        : food.source || 'No description available.'}
                    </p>
                    <button
                      className="primary-btn red"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(item);
                      }}
                    >
                      <img src={`${iconPath}delete.svg`} alt="" className="icon" />
                      Remove from Cookbook
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="none-saved">
            <img src={`${imgPath}recipes.svg`} alt="" />
            <h4>Your Recipes is empty</h4>
            <p>Start liking food to build your personal collection</p>
            <button className="primary-btn" onClick={() => navigate('/food')}>
              Discover foods
            </button>
          </div>
        )}
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

export default Recipes;