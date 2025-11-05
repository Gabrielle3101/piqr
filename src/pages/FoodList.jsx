import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Chatbot from '../components/Chatbot';
import { useAuth } from "../context/AuthContext";
import '../styles/FoodList.css';
import { addRecipeToFavorites } from '../firebaseUtils';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function FoodList() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedTime, selectedType, prepType, spiceLevel } = location.state || {};
  const [foods, setFoods] = useState([]);

  const handleLike = async (food) => {
    if (!user) {
      toast.info("Please log in to like recipes.");
      return;
    }
  
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
    } catch (err) {
      console.error("Error saving recipe:", err);
      toast.error("Failed to save recipe.");
    }
  };

  const fetchFoods = async () => {
    if (!selectedType || !selectedTime) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/recipes?q=${selectedType.toLowerCase()}&mealType=${selectedTime.toLowerCase()}&to=10`
      );
      const data = await response.json();
      const shuffled = data.hits.sort(() => 0.5 - Math.random());
      setFoods(shuffled.slice(0, 4));
    } catch (error) {
      console.error('Error fetching foods:', error);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, [selectedType, selectedTime]);

  const isLightMode = document.body.classList.contains('light');
    
  const iconPath = isLightMode ? '/assets/icons/light/' : '/assets/icons/';

  return (
    <div className="page">
      <Sidebar />
      <div className="food-list">
        <div className="header-row">
          <h1>Here are your picks</h1>
          <button className="refresh-btn" onClick={fetchFoods}>
            Refresh <img src={`${iconPath}refresh.svg`} alt="" className="icon" />
          </button>
        </div>
        <Link to="/food">🡠 Back</Link>

        <div className="card-grid">
          {foods.length > 0 ? (
            foods.map((item, index) => {
              const food = item.recipe;
              return (
                <div className="card-wrapper" key={index}>
                  <div
                    className="card"
                    onClick={() =>
                      navigate(`/fooddetail/${encodeURIComponent(food.uri)}`, {
                        state: {
                          recipe: food,
                          prepType,
                          selectedTime,
                          selectedType,
                          spiceLevel
                        },
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
                      <p className="click-info">
                        <img src="/assets/icons/info.svg" alt="" className="icon" />
                        Click card for detail view
                      </p>
                    </div>
                  </div>

                  <div className="action-buttons outside">
                  <button className="like-btn" onClick={() => handleLike(food)}>
                    <img src={`${iconPath}favorite.svg`} alt="" className="icon" /> Like
                  </button>
                    <button className="share-btn">
                      <img src={`${iconPath}share.svg`} alt="" className="icon" /> Share
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="no-results">No foods found for your selection.</p>
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

export default FoodList;