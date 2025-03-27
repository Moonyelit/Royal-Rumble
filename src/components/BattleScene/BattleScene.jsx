// BattleScene.jsx
import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import PlayerList from "../PlayerList/PlayerList";
import ProgressBar from "../ProgressBar/ProgressBar";
import CombatLog from "../CombatLog/CombatLog";
import AutoAttackButton from "../AutoAttackButton/AutoAttackButton";
import MusicControl from "../MusicControl/MusicControl";

// Images Neclord
import Neclord from "../../../public/Neclord/NeclordGif.gif";
import NeclordDeath from "../../../public/Neclord/Death.png";

// Images normales
import RiouGif from "../../../public/Riou/RiouGif.gif";
import ViktorGif from "../../../public/Viktor/ViktorGif.gif";
// Note: Il semble y avoir une inversion dans vos imports d'origine
// Je vais corriger cela dans le code ci-dessous
import NanamiGif from "../../../public/Nanami/NanamiGif.gif";
import SierraGif from "../../../public/Sierra/SierraGif.gif";
// Images de danger (PV bas)
import RiouDangerGif from "../../../public/Riou/RiouDangerGif.gif";
import ViktorDangerGif from "../../../public/Viktor/ViktorDangerGif.gif";
import NanamiDangerGif from "../../../public/Nanami/NanamiDangerGif.gif";
import SierraDangerGif from "../../../public/Sierra/SierraDangerGif.gif";
// Images de mort
import RiouDeath from "../../../public/Riou/RiouDeath.png";
import ViktorDeath from "../../../public/Viktor/ViktorDeath.png";
import NanamiDeath from "../../../public/Nanami/NanamiDeath.png";
import SierraDeath from "../../../public/Sierra/SierraDeath.gif";

import "./BattleScene.css";

function BattleScene() {
  // État pour contrôler l'affichage des fenêtres modales
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [showDefeatModal, setShowDefeatModal] = useState(false);
  
  // Références pour les éléments audio
  const victoryAudioRef = useRef(null);
  const deathAudioRef = useRef(null);
  const gameOverAudioRef = useRef(null);
  const battleMusicRef = useRef(null); // Nouvelle référence pour la musique de combat
  
  // Récupération du monstre, des joueurs et du statut du jeu
  const monster = useSelector((state) => state.fight.monster);
  const players = useSelector((state) => state.fight.players);
  const gameStatus = useSelector((state) => state.fight.gameStatus);

  // Effet pour initialiser la référence à la musique de combat
  useEffect(() => {
    // Trouver l'élément audio de la musique de bataille par son ID ou autre attribut
    const battleMusic = document.querySelector('audio[src*="neclord-battle.mp3"]');
    if (battleMusic) {
      battleMusicRef.current = battleMusic;
    }
  }, []);
  
  // Gérer l'animation de mort et les sons
  useEffect(() => {
    if (monster.pv === 0) {
      // Arrêter la musique de bataille
      if (battleMusicRef.current) {
        battleMusicRef.current.pause();
        battleMusicRef.current.currentTime = 0;
      }
      
      // Jouer immédiatement le son de mort
      if (deathAudioRef.current) {
        deathAudioRef.current.volume = 0.5;
        deathAudioRef.current.play().catch(e => console.log("Erreur audio mort:", e));
      }
      
      // Afficher la fenêtre de victoire après la fin de l'animation (4s)
      const timer = setTimeout(() => {
        setShowVictoryModal(true);
        // Jouer la musique de victoire
        if (victoryAudioRef.current) {
          victoryAudioRef.current.volume = 0.5;
          victoryAudioRef.current.play().catch(e => console.log("Erreur audio victoire:", e));
        }
      }, 4000); // Attendre 4 secondes pour correspondre à la durée de l'animation
      
      return () => clearTimeout(timer);
    }
  }, [monster.pv]);

  // Surveiller le statut du jeu pour détecter la défaite
  useEffect(() => {
    if (gameStatus === "defeat") {
      // Jouer le son de Game Over au lieu du son de mort
      if (gameOverAudioRef.current) {
        gameOverAudioRef.current.volume = 0.5;
        gameOverAudioRef.current.play().catch(e => console.log("Erreur audio game over:", e));
      }
      
      // Afficher la fenêtre de défaite après un court délai
      setTimeout(() => {
        setShowDefeatModal(true);
      }, 1000);
    }
  }, [gameStatus]);

  // Fonction pour redémarrer le jeu
  const handleRetry = () => {
    window.location.reload();
  };

  // Fonction pour déterminer quelle image afficher selon les PV du joueur
  const getHeroImage = (playerId, playerPV, playerPVMax) => {
    // Calculer le pourcentage de PV
    const pvPercentage = (playerPV / playerPVMax) * 100;

    // Sélectionner l'image en fonction de l'état de santé
    switch (playerId) {
      case 1: // Riou
        return {
          src:
            playerPV === 0
              ? RiouDeath
              : pvPercentage <= 30
              ? RiouDangerGif
              : RiouGif,
          className:
            playerPV === 0
              ? "hero-image-death"
              : pvPercentage <= 30
              ? "hero-image-danger"
              : "hero-image",
        };
      case 2: // Viktor
        return {
          src:
            playerPV === 0
              ? ViktorDeath
              : pvPercentage <= 30
              ? ViktorDangerGif
              : ViktorGif,
          className:
            playerPV === 0
              ? "hero-image-death"
              : pvPercentage <= 30
              ? "hero-image-danger"
              : "hero-image",
        };
      case 3: // Nanami
        return {
          src:
            playerPV === 0
              ? NanamiDeath
              : pvPercentage <= 30
              ? NanamiDangerGif
              : NanamiGif,
          className:
            playerPV === 0
              ? "hero-image-death"
              : pvPercentage <= 30
              ? "hero-image-danger"
              : "hero-image",
        };
      case 4: // Sierra
        return {
          src:
            playerPV === 0
              ? SierraDeath
              : pvPercentage <= 30
              ? SierraDangerGif
              : SierraGif,
          className:
            playerPV === 0
              ? "hero-image-death"
              : pvPercentage <= 30
              ? "hero-image-danger"
              : "hero-image",
        };
      default:
        return { src: null, className: "" };
    }
  };

  return (
    <div className="battle-scene">
      {/* Overlay sombre pour les modales */}
      {(showVictoryModal || showDefeatModal) && (
        <div className="modal-overlay"></div>
      )}
      
      {/* Éléments audio */}
      <audio ref={victoryAudioRef} src="/music/Victory.mp3" preload="auto" />
      <audio ref={deathAudioRef} src="/music/Death.mp3" preload="auto" />
      <audio ref={gameOverAudioRef} src="/music/GameOver.mp3" preload="auto" />
      
      {/* Contrôle de la musique */}
      <MusicControl />

      {/* Info du boss en haut */}
      <div className="boss-info">
        <h1>{monster.name}</h1>
        <div className="boss-hp">
          <ProgressBar
            pv={monster.pv}
            pvMax={monster.pvMax}
            faType="fa-heart"
            barName=" PV"
            bgType="bg-danger"
          />
        </div>
      </div>

      {/* Image du monstre au centre */}
      <img
        className={`monster-image ${
          monster.pv === 0 ? "monster-death-animation" : ""
        }`}
        src={monster.pv === 0 ? NeclordDeath : Neclord}
        alt={monster.name}
      />

      <div className="Heros-sections">
        {/* Images des personnages avec affichage conditionnel */}
        {players.map((player) => {
          const heroImage = getHeroImage(player.id, player.pv, player.pvMax);
          const classNameMap = {
            1: "Riou-image",
            2: "Viktor-image",
            3: "Nanami-image",
            4: "Sierra-image",
          };

          return (
            <img
              key={player.id}
              className={`${classNameMap[player.id]} ${heroImage.className}`}
              src={heroImage.src}
              alt={player.name}
            />
          );
        })}
      </div>

      {/* Log sur la droite */}
      <div className="combat-log-container">
        <CombatLog />
      </div>

      {/* Bouton d'auto-attaque sous le journal de combat */}
      <div className="auto-attack-wrapper">
        <AutoAttackButton />
      </div>

      {/* Joueurs en bas */}
      <div className="players-row">
        <PlayerList />
      </div>

      {/* Fenêtre de victoire conditionnellement rendue */}
      {showVictoryModal && (
        <div className="victory-modal">
          <h2>Félicitations !</h2>
          <p>Vous avez vaincu le boss !</p>
          <button className="retry-button" onClick={handleRetry}>
            Réessayer ?
          </button>
        </div>
      )}

      {/* Fenêtre de défaite conditionnellement rendue */}
      {showDefeatModal && (
        <div className="defeat-modal">
          <h2>Dommage !</h2>
          <p>Vous y étiez presque ! Encore un effort ! </p>
          <button className="retry-button" onClick={handleRetry}>
            Recommencer ?
          </button>
        </div>
      )}
    </div>
  );
}

export default BattleScene;
