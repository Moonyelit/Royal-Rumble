import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { autoAttack, monsterAttack } from '../../features/fight/fightSlice';

function AutoAttackButton() {
  const dispatch = useDispatch();
  const gameStatus = useSelector(state => state.fight.gameStatus);
  const playersWhoActed = useSelector(state => state.fight.playersWhoActed);
  const players = useSelector(state => state.fight.players);
  
  // Vérifier si tous les joueurs ont déjà agi ou sont morts
  const allPlayersActedOrDead = players.every(player => 
    playersWhoActed.includes(player.id) || player.pv === 0
  );
  
  const handleAutoAttack = () => {
    // Faire attaquer tous les joueurs automatiquement
    dispatch(autoAttack());
    
    // Après un court délai, faire attaquer le monstre
    setTimeout(() => {
      if (gameStatus === "playing") {
        dispatch(monsterAttack());
      }
    }, 1000);
  };
  
  return (
    <div className="auto-attack-container mt-3 mb-3">
      <button 
        className="btn btn-danger btn-lg" 
        onClick={handleAutoAttack}
        disabled={allPlayersActedOrDead || gameStatus !== "playing"}
        style={{ 
          width: '100%',
          maxWidth: '300px',
          margin: '0 auto',
          display: 'block',
          fontWeight: 'bold'
        }}
      >
        <i className="fas fa-bolt mr-2"></i>
        Attaque Automatique
      </button>
    </div>
  );
}

export default AutoAttackButton;