import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { autoAttack, monsterAttack } from '../../features/fight/fightSlice';

function AutoAttackButton() {
  const dispatch = useDispatch();
  const gameStatus = useSelector(state => state.fight.gameStatus);
  const playersWhoActed = useSelector(state => state.fight.playersWhoActed);
  const players = useSelector(state => state.fight.players);
  
  // Référence audio pour le son de clic
  const clickSoundRef = useRef(null);
  
  // Vérifier si tous les joueurs ont déjà agi ou sont morts
  const allPlayersActedOrDead = players.every(player => 
    playersWhoActed.includes(player.id) || player.pv === 0
  );
  
  const handleAutoAttack = () => {
    // Jouer le son de clic
    if (clickSoundRef.current) {
      clickSoundRef.current.currentTime = 0;
      clickSoundRef.current.play().catch(e => console.log("Erreur audio:", e));
    }
    
    // Ajouter un message au début de l'auto-attaque
    if (window.addCombatLogMessage) {
      window.addCombatLogMessage("Mode auto-attaque activé: les héros utilisent leurs meilleures capacités!", "info");
    }
    
    // S'assurer que les messages du journal apparaissent avant d'envoyer l'action
    setTimeout(() => {
      // Faire attaquer tous les joueurs automatiquement
      dispatch(autoAttack());
      
      // Après un court délai, faire attaquer le monstre
      setTimeout(() => {
        if (gameStatus === "playing") {
          dispatch(monsterAttack());
        }
      }, 1500); // Délai plus long pour laisser les messages s'afficher
    }, 100);
  };
  
  return (
    <div className="auto-attack-container mt-3 mb-3">
      {/* Élément audio pour le son de clic */}
      <audio ref={clickSoundRef} src="/music/Menu-cursor.mp3" preload="auto" />
      
      <button 
        className="btn btn-danger btn-lg auto-attack-button" 
        onClick={handleAutoAttack}
        disabled={allPlayersActedOrDead || gameStatus !== "playing"}
      >
        <i className="fas fa-bolt mr-2"></i>
        Attaque Automatique
      </button>
    </div>
  );
}

export default AutoAttackButton;