import { useNavigate } from "react-router-dom";
import React from "react";
import '../styles/LandingPage.css'
import ThemeToggle from "../components/ThemeToggle";

function LandingPage() {
  const navigate = useNavigate();

  const isLightMode = document.body.classList.contains('light');
  const imgPath = isLightMode ? '/assets/img/light/' : '/assets/img/';

  return (
    <>
      <div className="lp">
        <header className="navbar">
          <div className="logo">
          <img src={`${imgPath}logo.png`} alt="" className="logo-img" />
            <span className="logo-txt">Piqr</span>
          </div>
          <div>
            <ThemeToggle />
            <button onClick={() => navigate("/auth")} className="primary-btn">
              Get Started
            </button>
          </div>
            
        </header>
        <div className="hero-section">
          <div className="hero-info">
            <h1>Decisions <span>made Simple.</span></h1>
            <p>
              No stress, no scrolling just instant recommendations that fit your mood for food, film, and fun.
            </p>
            <button onClick={() => navigate("/auth")} className="primary-btn">
              Get Started
            </button>
            <button onClick={() => navigate("/dashboard")} className="secondary-btn">
              Explore First
            </button>
            <div className="features">
              <p>
                <img src="/assets/icons/double-ticks.svg" alt="" className="icon" />
                Smart mood matcher
              </p>
              <p>
                <img src="/assets/icons/double-ticks.svg" alt="" className="icon" />
                Movie + Meal Combos
              </p>
              <p>
                <img src="/assets/icons/double-ticks.svg" alt="" className="icon" />
                Seamless, stress-free choices
              </p>
            </div>
          </div>
          <div className="hero-img">
            <img src="/assets/img/hero-img.png" alt="" />
          </div>
        </div>
      </div>
    </>
  );
}

export default LandingPage;
