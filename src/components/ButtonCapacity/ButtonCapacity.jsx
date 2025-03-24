import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hitMonster, hitBack } from "../../features/fight/fightSlice";

function ButtonCapacity({ player, attackType, damage, manaCost, icon }) {
  const dispatch = useDispatch();
  const [message, setMessage] = useState(null);
  const gameStatus = useSelector(state => state.fight.gameStatus);
  const playersWhoActed = useSelector(state => state.fight.playersWhoActed);
  
  // Vérifier si ce joueur a déjà agi
  const hasPlayerActed = playersWhoActed.includes(player.id);

  // Effet pour nettoyer le timeout si le composant est démonté
  useEffect(() => {
    let timeout;
    if (message) {
      timeout = setTimeout(() => {
        setMessage(null);
      }, 2000); // Le message disparaît après 2 secondes
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [message]);

  // Effet pour afficher un message en fonction du statut du jeu
  useEffect(() => {
    if (gameStatus === "defeat") {
      setMessage("DÉFAITE ! Tous les joueurs sont morts.");
    } else if (gameStatus === "victory") {
      setMessage("VICTOIRE ! Le monstre a été vaincu !");
    }
  }, [gameStatus]);

  // Ajouter cet effet pour afficher un message si le joueur est mort ou a déjà agi
  useEffect(() => {
    if (player.pv === 0) {
      setMessage("Ce joueur n'a plus de PV, il ne peut plus attaquer !");
    } else if (hasPlayerActed) {
      setMessage("Ce joueur a déjà agi ce tour, attendez que les autres agissent.");
    }
  }, [player.pv, hasPlayerActed]);

  const fight = () => {
    if (player.pv > 0 && player.mana >= manaCost && !hasPlayerActed) {
      // Le joueur attaque le monstre
      dispatch(hitMonster({ damage, playerId: player.id, manaCost }));

      function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
      
      // Probabilité de 20% que le monstre rate son attaque
      const monsterMissesAttack = Math.random() <= 0.2;
      
      if (!monsterMissesAttack) {
        // Le monstre réussit son attaque (80% de chance)
        const randomDamage = getRandomInt(3, 8);
        
        // Le monstre contre-attaque le joueur qui l'a attaqué
        dispatch(hitBack({ damage: randomDamage, playerId: player.id }));
        
        // Afficher un message pour l'attaque réussie
        setMessage(`Le monstre contre-attaque et inflige ${randomDamage} dégâts!`);
      } else {
        // Le monstre rate son attaque
        setMessage("Le monstre rate son attaque!");
      }
    }
  };

  return (
    <div>
      <button 
        className="btn btn-sm m-1" 
        onClick={fight}
        disabled={(player.pv === 0) || (player.mana < manaCost) || (gameStatus !== "playing") || hasPlayerActed}
        style={{ 
          backgroundColor: hasPlayerActed ? "#6c757d" : "#007bff", 
          color: "white" 
        }}
      >
        <i className={`fas ${icon} mr-1`}></i>
        {attackType} ({damage})
      </button>
      
      {message && (
        <div 
          style={{
            position: "absolute",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "5px 10px",
            borderRadius: "5px",
            fontSize: "0.9rem",
            marginTop: "5px",
            zIndex: 100
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}

export default ButtonCapacity;