import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

// Modifier cette ligne pour inclure monsterAttack
import { hitMonster, hitBack, monsterAttack } from "../../features/fight/fightSlice";

// Uniquement pour les messages de mort
const hasShownDeathMessageByPlayer = {};

function ButtonCapacity({ player, attackType, damage, manaCost, icon, targetType, needsTargetSelection }) {
  const dispatch = useDispatch();
  const [message, setMessage] = useState(null);
  const gameStatus = useSelector(state => state.fight.gameStatus);
  const playersWhoActed = useSelector(state => state.fight.playersWhoActed);
  const players = useSelector(state => state.fight.players);
  
  // Vérifier si ce joueur a déjà agi
  const hasPlayerActed = playersWhoActed.includes(player.id);
  
  // Vérifier si le joueur a assez de mana
  const hasEnoughMana = player.mana >= manaCost;

  // Effet pour nettoyer les messages après 2 secondes
  useEffect(() => {
    let timeout;
    if (message) {
      timeout = setTimeout(() => {
        setMessage(null);
      }, 2000);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [message]);

  // Effet pour gérer le message "pas de PV" - seulement lors d'un changement
  const previousPV = useRef(player.pv);
  
  useEffect(() => {
    if (player.pv !== previousPV.current) {
      previousPV.current = player.pv;
      
      if (player.pv === 0 && !hasShownDeathMessageByPlayer[player.id] && window.addCombatLogMessage) {
        window.addCombatLogMessage(`${player.name} n'a plus de PV, il ne peut plus attaquer !`, "warning");
        hasShownDeathMessageByPlayer[player.id] = true;
      } else if (player.pv > 0) {
        hasShownDeathMessageByPlayer[player.id] = false;
      }
    }
  }, [player.pv, player.name, player.id]);
  
  const fight = () => {
    if (player.pv > 0 && player.mana >= manaCost && !hasPlayerActed) {
      // Le joueur attaque le monstre
      dispatch(hitMonster({ damage, playerId: player.id, manaCost }));
      
      // Ajouter un message pour l'attaque du joueur
      if (window.addCombatLogMessage) {
        window.addCombatLogMessage(`${player.name} attaque Neclord et inflige ${damage} dégâts!`, "primary");
      }

      function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
      
      // Probabilité de 30% que le monstre rate sa contre-attaque
      const monsterMissesAttack = Math.random() <= 0.3;
      
      if (!monsterMissesAttack) {
        // Le monstre réussit sa contre-attaque (70% de chance)
        const randomDamage = getRandomInt(3, 8);
        
        // Le monstre contre-attaque le joueur qui l'a attaqué
        dispatch(hitBack({ damage: randomDamage, playerId: player.id }));
        
        // Afficher un message pour la contre-attaque réussie
        if (window.addCombatLogMessage) {
          window.addCombatLogMessage(`Neclord contre-attaque ${player.name} et inflige ${randomDamage} dégâts!`, "danger");
        }
      } else {
        // Le monstre rate sa contre-attaque
        if (window.addCombatLogMessage) {
          window.addCombatLogMessage("Neclord rate sa contre-attaque!", "success");
        }
      }
      
      // Vérifier si c'est le dernier joueur vivant à jouer
      const alivePlayers = players.filter(p => p.pv > 0);
      const playersWhoWillHaveActed = [...playersWhoActed, player.id];
      
      // Si tous les joueurs vivants ont agi, le monstre attaque
      if (alivePlayers.length > 0 && alivePlayers.every(p => playersWhoWillHaveActed.includes(p.id))) {
        if (window.addCombatLogMessage) {
          window.addCombatLogMessage("Tous les héros ont agi, c'est au tour de Neclord!", "warning");
        }
        
        // Décommenter cette ligne pour activer l'attaque du monstre
        setTimeout(() => {
          dispatch(monsterAttack());
        }, 1000);
      }
    }
  };

  const handleClick = () => {
    // Vérifier si le joueur a assez de mana
    if (player.mana < manaCost) {
      setMessage(`Pas assez de mana! (${player.mana}/${manaCost})`);
      return;
    }

    if (targetType === "ally" && needsTargetSelection) {
      // Logique de sélection de cible...
    } else {
      fight();
    }
  };

  return (
    <div>
      <button 
        className={`ability-button ${hasPlayerActed ? 'has-acted' : (!hasEnoughMana ? 'not-enough-mana' : 'default')}`} 
        onClick={handleClick}
        disabled={(player.pv === 0) || (player.mana < manaCost) || (gameStatus !== "playing") || hasPlayerActed}
      >
        <i className={`fas ${icon} mr-1`}></i>
        {attackType} ({damage})
        {manaCost > 0 && <span className="ml-1">({manaCost} mana)</span>}
      </button>
      
      {message && (
        <div className="message-popup">
          {message}
        </div>
      )}
    </div>
  );
}

export default ButtonCapacity;