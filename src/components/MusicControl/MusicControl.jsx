import React, { useState, useEffect, useRef } from "react";
import { useSelector } from 'react-redux';
import "./MusicControl.css";

function MusicControl() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const audioRef = useRef(null);
  const gameStatus = useSelector((state) => state.fight.gameStatus);
  const monsterPV = useSelector((state) => state.fight.monster.pv);

  // Initialisation de l'audio
  useEffect(() => {
    const audio = new Audio("/music/neclord-battle.mp3");
    
    audio.addEventListener('canplaythrough', () => {
      console.log("Audio chargé avec succès");
      setAudioLoaded(true);
    });
    
    audio.addEventListener('error', (e) => {
      console.error("Erreur de chargement audio:", e);
    });
    
    audioRef.current = audio;
    
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Contrôle de la lecture
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise) {
        playPromise.catch(err => {
          console.error("Erreur lors de la lecture:", err);
          setIsPlaying(false);
        });
      }
    } else {
      audioRef.current.pause();
    }
    
    // Activer la lecture en boucle
    audioRef.current.loop = true;
  }, [isPlaying]);

  // Arrêter la musique quand le jeu est terminé (victoire ou défaite)
  useEffect(() => {
    if (gameStatus === 'victory' || gameStatus === 'defeat' || monsterPV === 0) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [gameStatus, monsterPV]);

  const togglePlay = () => {
    if (audioLoaded) {
      setIsPlaying(!isPlaying);
    } else {
      console.warn("Audio pas encore chargé");
    }
  };

  return (
    <div className="music-control">
      <button 
        className={`music-button ${isPlaying ? "playing" : "paused"}`} 
        onClick={togglePlay}
        title={isPlaying ? "Couper la musique" : "Activer la musique"}
        disabled={!audioLoaded}
      >
        <i className={`fas ${isPlaying ? "fa-volume-up" : "fa-volume-mute"}`}></i>
      </button>
    </div>
  );
}

export default MusicControl;