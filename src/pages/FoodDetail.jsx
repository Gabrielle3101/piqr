import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Chatbot from '../components/Chatbot';
import { useAuth } from "../context/AuthContext";
import { addRecipeToFavorites } from '../firebaseUtils';
import '../styles/FoodDetail.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useTheme from '../hooks/useTheme';

function FallbackImage({ src, alt, fallback = '/assets/img/food-placeholder.png', ...props }) {
  return (
    <img
      src={src}
      alt={alt}
      onError={(e) => {
        if (e.target.src !== fallback) {
          e.target.src = fallback;
        }
      }}
      {...props}
    />
  );
}

function FoodDetail() {
  const { user } = useAuth();
  const location = useLocation();
  const {
    recipe,
    prepType,
    selectedTime,
    selectedType,
    spiceLevel
  } = location.state || {};

  const theme = useTheme();
  const isLightMode = ['light', 'pinkgummy', 'sunset'].includes(theme);
  const iconPath = isLightMode ? '/assets/icons/light/' : '/assets/icons/';

  const [food] = useState(recipe);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleAddToCookbook = async () => {
    if (!user) {
      toast.info("Please log in to save items.");
      return;
    }

    if (isSaved) {
      toast.info("This recipe is already in your Cookbook.");
      return;
    }

    setIsSaving(true);

    const recipeItem = {
      recipe: food,
      prepType,
      selectedTime,
      selectedType,
      spiceLevel
    };

    try {
      await addRecipeToFavorites(user.uid, recipeItem);
      toast.success("Recipe added to your Cookbook!");
      setIsSaved(true);
    } catch (err) {
      console.error("Error saving recipe:", err);
      toast.error("Failed to save recipe.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!food) return <p>No recipe data available.</p>;

  const isOrderOut = prepType?.toLowerCase() === "order out (fast food)";
  const isMakeAtHome = prepType?.toLowerCase() === "make it at home from scratch";

  return (
    <div className="page">
      <Sidebar />
      <div className="food-detail">
        <div className="header-row">
          <h1>Here are your picks</h1>
        </div>
        <Link className="back" to="/foodlist">🡠 Back</Link>

        <div className="columns">
          <div className="left-column">
            <div className="image-wrapper">
              <FallbackImage src={food.image} alt={food.label} />
              <div className="tag top-right">{prepType}</div>
            </div>
          </div>

          <div className="right-column">
            <h1>{food.label}</h1>
            <div className="meta-info2">
              <span>{selectedTime}</span>
              <span>{prepType}</span>
            </div>
            <h3>Description</h3>
            <p className="synopsis">{food.source || 'No description available.'}</p>
            <div className="food-tags">
              <span>{selectedTime}</span>
              <span>{selectedType}</span>
              <span>{spiceLevel}</span>
            </div>

            {isMakeAtHome && (
              <div className="recipes-duration">
                <img src={`${iconPath}schedule.svg`} alt="" className="icon" />
                <p>
                  Prep time <span>{Math.round(food.totalTime * 0.3) || '—'} mins</span>
                </p>
                <p>
                  Cook time <span>{Math.round(food.totalTime * 0.7) || '—'} mins</span>
                </p>
              </div>
            )}

            <button
              className="favorite-btn primary-btn"
              onClick={handleAddToCookbook}
              disabled={isSaving || isSaved || isOrderOut}
            >
              {isOrderOut
                ? "Order Out (Coming Soon)"
                : isSaving
                ? "Saving..."
                : isSaved
                ? "Saved"
                : "Add to Cookbook"}
            </button>
          </div>
        </div>

        {isMakeAtHome && (
          <div className="additional-info">
            <h2>Recipes</h2>
            {food.ingredientLines?.length > 0 && (
              <div className="recipe-section">
                <h3>Ingredients</h3>
                <ul className="ingredients">
                  {food.ingredientLines.map((line, index) => (
                    <li key={index}>* {line}</li>
                  ))}
                </ul>
                <Link to={food.url} target="_blank" rel="noreferrer" className="recipe-link">
                  View Full Instructions
                </Link>
              </div>
            )}
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

export default FoodDetail;