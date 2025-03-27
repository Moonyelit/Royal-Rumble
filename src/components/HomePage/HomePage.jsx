import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import backgroundGif from "/BackgroundGif.gif"; // Import du GIF

function HomePage() {
  const navigate = useNavigate();

  const handleStartCombat = () => {
    // Son de clic éventuel
    navigate("/battle");
  };

  return (
    <div 
      className="home-container" 
      style={{ backgroundImage: `url(${backgroundGif})` }}
    >
      <div className="home-content">
      <img src="/Autre/Suikoden_II_Logo.svg.png" alt="Suikoden II Logo" className="home-logo" />
      <p className="home-description">
          Affrontez Neclord avec Riou et ses compagnons dans ce combat épique!
          <br />
          <br />
          Le jeu a été pensé sur ordinateur. Il n'y a pas de version mobile de
          disponible pour le moment.
        </p>
        <button className="combat-button" onClick={handleStartCombat}>
          <i className="fas fa-sword mr-2"></i>
          COMBATTRE
        </button>
      </div>
    </div>
  );
}

export default HomePage;
