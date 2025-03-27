import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

// Modifier cette ligne pour inclure resurrectAlly
import { hitMonster, hitBack, monsterAttack, healAlly, resurrectAlly } from "../../features/fight/fightSlice";

// Uniquement pour les messages de mort
const hasShownDeathMessageByPlayer = {};

function ButtonCapacity({ player, attackType, damage, manaCost, icon, targetType, needsTargetSelection, healAllies, tauntDuration }) {
  const dispatch = useDispatch();
  const [message, setMessage] = useState(null);
  const [showTargetSelection, setShowTargetSelection] = useState(false);
  const gameStatus = useSelector(state => state.fight.gameStatus);
  const playersWhoActed = useSelector(state => state.fight.playersWhoActed);
  const players = useSelector(state => state.fight.players);
  
  // Référence audio pour le son de clic
  const clickSoundRef = useRef(null);
  
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
  
  const handleTargetSelect = (targetPlayer) => {
    // Jouer le son de clic
    if (clickSoundRef.current) {
      clickSoundRef.current.currentTime = 0;
      clickSoundRef.current.play().catch(e => console.log("Erreur audio:", e));
    }
    
    // Code existant pour soigner un allié...
    if (targetType === "ally" && targetPlayer.pv > 0) {
      // Envoyer l'action pour soigner l'allié
      dispatch(healAlly({
        allyId: targetPlayer.id,
        healAmount: Math.abs(damage),  // conversion de -30 à 30 pour le soin
        casterId: player.id,
        manaCost
      }));
      
      // Message pour l'action de soin
      if (window.addCombatLogMessage) {
        window.addCombatLogMessage(
          `${player.name} utilise ${attackType} et soigne ${targetPlayer.name} de ${Math.abs(damage)} points de vie!`, 
          "success"
        );
      }
      
      // Fermer la sélection de cible
      setShowTargetSelection(false);
      
      // Contre-attaque potentielle du monstre
      const monsterMissesAttack = Math.random() <= 0.3;
      if (!monsterMissesAttack) {
        const randomDamage = Math.floor(Math.random() * 6) + 3;
        dispatch(hitBack({ damage: randomDamage, playerId: player.id }));
        
        if (window.addCombatLogMessage) {
          window.addCombatLogMessage(`Neclord contre-attaque ${player.name} et inflige ${randomDamage} dégâts!`, "danger");
        }
      } else {
        if (window.addCombatLogMessage) {
          window.addCombatLogMessage("Neclord rate sa contre-attaque!", "success");
        }
      }
      
      // Vérification pour l'attaque du monstre
      const alivePlayers = players.filter(p => p.pv > 0);
      const playersWhoWillHaveActed = [...playersWhoActed, player.id];
      
      if (alivePlayers.length > 0 && alivePlayers.every(p => playersWhoWillHaveActed.includes(p.id))) {
        if (window.addCombatLogMessage) {
          window.addCombatLogMessage("Tous les héros ont agi, c'est au tour de Neclord!", "warning");
        }
        
        setTimeout(() => {
          dispatch(monsterAttack());
        }, 1000);
      }
    }
    // Nouveau code pour réanimer un allié mort
    else if (targetType === "deadAlly" && targetPlayer.pv === 0) {
      // Calcul de la moitié des PV max
      const resurrectionAmount = Math.floor(targetPlayer.pvMax / 2);
      
      // Envoyer l'action pour réanimer l'allié
      dispatch(resurrectAlly({
        allyId: targetPlayer.id,
        healAmount: resurrectionAmount,
        casterId: player.id,
        manaCost
      }));
      
      // Message pour l'action de réanimation
      if (window.addCombatLogMessage) {
        window.addCombatLogMessage(
          `${player.name} utilise ${attackType} et réanime ${targetPlayer.name} avec ${resurrectionAmount} points de vie!`, 
          "success"
        );
      }
      
      // Fermer la sélection de cible
      setShowTargetSelection(false);
      
      // Contre-attaque potentielle du monstre - code existant...
      const monsterMissesAttack = Math.random() <= 0.3;
      if (!monsterMissesAttack) {
        const randomDamage = Math.floor(Math.random() * 6) + 3;
        dispatch(hitBack({ damage: randomDamage, playerId: player.id }));
        
        if (window.addCombatLogMessage) {
          window.addCombatLogMessage(`Neclord contre-attaque ${player.name} et inflige ${randomDamage} dégâts!`, "danger");
        }
      } else {
        if (window.addCombatLogMessage) {
          window.addCombatLogMessage("Neclord rate sa contre-attaque!", "success");
        }
      }
      
      // Vérification pour l'attaque du monstre
      const alivePlayers = players.filter(p => p.pv > 0);
      const playersWhoWillHaveActed = [...playersWhoActed, player.id];
      
      if (alivePlayers.length > 0 && alivePlayers.every(p => playersWhoWillHaveActed.includes(p.id))) {
        if (window.addCombatLogMessage) {
          window.addCombatLogMessage("Tous les héros ont agi, c'est au tour de Neclord!", "warning");
        }
        
        setTimeout(() => {
          dispatch(monsterAttack());
        }, 1000);
      }
    }
  };
  
  const fight = () => {
    if (player.pv > 0 && player.mana >= manaCost && !hasPlayerActed) {
      // Le joueur attaque le monstre
      dispatch(hitMonster({ 
        damage, 
        playerId: player.id, 
        manaCost,
        healAllies,
        targetType,
        tauntDuration
      }));
      
      // Message pour l'attaque du joueur
      if (window.addCombatLogMessage) {
        window.addCombatLogMessage(`${player.name} utilise ${attackType} et inflige ${damage} dégâts à Neclord!`, "primary");
        
        // Si c'est une capacité de provocation, ajouter un message
        if (tauntDuration) {
          window.addCombatLogMessage(`${player.name} a provoqué Neclord qui va le cibler pendant ${tauntDuration} tours!`, "warning");
        }
        
        // Ajouter un message de soin si c'est une capacité qui soigne les alliés
        if (healAllies && targetType === "enemyAndAllies") {
          window.addCombatLogMessage(`${attackType} soigne tous les alliés de ${healAllies} PV!`, "success");
        }
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
    // Jouer le son de clic
    if (clickSoundRef.current) {
      clickSoundRef.current.currentTime = 0; // Remettre le son au début
      clickSoundRef.current.play().catch(e => console.log("Erreur audio:", e));
    }

    // Vérifier si le joueur a assez de mana
    if (player.mana < manaCost) {
      setMessage(`Pas assez de mana! (${player.mana}/${manaCost})`);
      return;
    }

    // Si c'est une capacité qui nécessite la sélection d'un allié (vivant ou mort)
    if ((targetType === "ally" || targetType === "deadAlly") && needsTargetSelection) {
      // Afficher l'interface de sélection d'allié
      setShowTargetSelection(true);
    } else {
      fight();
    }
  };

  return (
    <div>
      {/* Élément audio pour le son de clic */}
      <audio ref={clickSoundRef} src="/music/Menu-cursor.mp3" preload="auto" />
      
      <button 
        className={`ability-button ${hasPlayerActed ? 'has-acted' : (!hasEnoughMana ? 'not-enough-mana' : 'default')}`} 
        onClick={handleClick}
        disabled={(player.pv === 0) || (player.mana < manaCost) || (gameStatus !== "playing") || hasPlayerActed}
      >
        <div className="ability-content">
          <div className="ability-main">
            <i className={`fas ${icon}`}></i>
            <span className="ability-name">{attackType}</span>
          </div>
          <div className="ability-details">
            <span className="ability-damage">({Math.abs(damage)} {damage < 0 ? 'PV' : 'dégâts'})</span>
            {manaCost > 0 && <span className="ability-mana">({manaCost} mana)</span>}
          </div>
        </div>
      </button>
      
      {message && (
        <div className="message-popup">
          {message}
        </div>
      )}
      
      {/* Interface de sélection d'allié ou d'allié mort */}
      {showTargetSelection && (
        <div className="ally-selection-overlay">
          <div className="ally-selection-modal">
            <h4>
              {targetType === "ally" 
                ? "Choisir un allié à soigner:" 
                : "Choisir un allié à réanimer:"}
            </h4>
            <div className="ally-selection-grid">
              {players.map((p, index) => {
                // Pour le soin normal, ne montrer que les alliés vivants
                // Pour la réanimation, ne montrer que les alliés morts
                const shouldDisplay = 
                  (targetType === "ally" && p.pv > 0) || 
                  (targetType === "deadAlly" && p.pv === 0);
                
                if (!shouldDisplay) return null;
                
                return (
                  <button
                    key={p.id}
                    className="ally-selection-button"
                    onClick={() => handleTargetSelect(p)}
                    style={{ '--index': index }}
                  >
                    <img 
                      src={p.image} 
                      alt={p.name} 
                      style={targetType === "deadAlly" ? {filter: "grayscale(80%)"} : {}}
                    />
                    <div className="ally-name">{p.name}</div>
                    <div className="ally-health">
                      {targetType === "ally" 
                        ? `${p.pv}/${p.pvMax} PV` 
                        : "Hors combat"}
                    </div>
                  </button>
                );
              })}
            </div>
            <button className="cancel-button" onClick={() => setShowTargetSelection(false)}>
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ButtonCapacity;