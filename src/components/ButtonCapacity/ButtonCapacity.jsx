import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hitMonster, hitBack, monsterAttack, healAlly, resurrectAlly } from "../../features/fight/fightSlice";

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
      
      // Probabilité de 30% que le monstre rate sa contre-attaque
      const monsterMissesAttack = Math.random() <= 0.3;
      
      if (!monsterMissesAttack) {
        // Le monstre réussit sa contre-attaque (70% de chance)
        const randomDamage = getRandomInt(3, 8);
        
        // Le monstre contre-attaque le joueur qui l'a attaqué
        dispatch(hitBack({ damage: randomDamage, playerId: player.id }));
        
        // Afficher un message pour la contre-attaque réussie
        setMessage(`Le monstre contre-attaque et inflige ${randomDamage} dégâts!`);
      } else {
        // Le monstre rate sa contre-attaque
        setMessage("Le monstre rate sa contre-attaque!");
      }
      
      // Vérifier si c'est le dernier joueur vivant à jouer
      const alivePlayers = players.filter(p => p.pv > 0);
      const playersWhoWillHaveActed = [...playersWhoActed, player.id];
      const allPlayersWillHaveActed = alivePlayers.every(p => 
        playersWhoWillHaveActed.includes(p.id)
      );
      
      // Si tous les joueurs ont joué, déclencher l'attaque spéciale du monstre
      if (allPlayersWillHaveActed && gameStatus === "playing") {
        setTimeout(() => {
          dispatch(monsterAttack());
        }, 1000); // Attendre 1 seconde avant l'attaque du monstre
      }
    }
  };

  const handleClick = () => {
    // Vérifier si le joueur a assez de mana
    if (player.mana < manaCost) {
      alert("Pas assez de mana!");
      return;
    }

    if (targetType === "ally" && needsTargetSelection) {

      
      // Filtrer les alliés en excluant l'ennemi et le joueur actuel
      const allies = players.filter(p => 
        p.id !== player.id && // Exclure le joueur actuel
        p.id !== 5 &&         // Exclure Neclord (ajustez cet ID selon votre structure)
        p.pv > 0              // Exclure les joueurs déjà vaincus
      );
      
      // Le reste du code reste inchangé
      if (allies.length === 0) {
        alert("Aucun allié disponible à soigner!");
        return;
      }
      
      // Créer une liste des alliés pour l'affichage
      const alliesOptions = allies.map((ally, index) => 
        `${index + 1}. ${ally.name} (PV: ${ally.pv}/${ally.pvMax})`
      ).join('\n');
      
      // Demander à l'utilisateur de choisir un allié
      const choice = prompt(`Choisissez un allié à soigner:\n${alliesOptions}`, "1");
      
      // Si un choix valide a été fait
      if (choice && !isNaN(choice) && parseInt(choice) > 0 && parseInt(choice) <= allies.length) {
        const selectedAlly = allies[parseInt(choice) - 1];
        
        // Dispatcher l'action de soin
        dispatch(healAlly({
          allyId: selectedAlly.id,
          healAmount: damage, // damage est négatif pour le soin
          casterId: player.id,
          manaCost: manaCost
        }));
      }
    } else if (targetType === "deadAlly" && needsTargetSelection) {
      // Filtrer uniquement les alliés morts
      const deadAllies = players.filter(p => 
        p.id !== player.id && // Exclure le joueur actuel
        p.id !== 5 &&         // Exclure Neclord (ajustez si nécessaire)
        p.pv === 0            // Uniquement les joueurs morts
      );
      
      if (deadAllies.length === 0) {
        alert("Aucun allié mort à ressusciter!");
        return;
      }
      
      // Créer une liste des alliés morts pour l'affichage
      const deadAlliesOptions = deadAllies.map((ally, index) => 
        `${index + 1}. ${ally.name}`
      ).join('\n');
      
      // Demander à l'utilisateur de choisir un allié mort
      const choice = prompt(`Choisissez un allié à ressusciter:\n${deadAlliesOptions}`, "1");
      
      // Si un choix valide a été fait
      if (choice && !isNaN(choice) && parseInt(choice) > 0 && parseInt(choice) <= deadAllies.length) {
        const selectedAlly = deadAllies[parseInt(choice) - 1];
        
        // Calculer la moitié des PV max pour la résurrection
        const resurrectionHP = Math.floor(selectedAlly.pvMax / 2);
        
        // Dispatcher l'action de résurrection
        dispatch(resurrectAlly({
          allyId: selectedAlly.id,
          resurrectAmount: resurrectionHP,
          casterId: player.id,
          manaCost: manaCost
        }));
        
        // Afficher un message de confirmation
        setMessage(`${player.name} ressuscite ${selectedAlly.name} avec ${resurrectionHP} PV!`);
      }
    } else {
      // Votre logique existante pour les autres types d'attaques
      fight();
    }
  };

  return (
    <div>
      <button 
        className={`btn btn-sm m-1 button-capacity ${hasPlayerActed ? 'has-acted' : (!hasEnoughMana ? 'not-enough-mana' : 'default')}`} 
        onClick={handleClick}
        disabled={(player.pv === 0) || (player.mana < manaCost) || (gameStatus !== "playing") || hasPlayerActed}
      >
        <i className={`fas ${icon} mr-1`}></i>
        {attackType} ({damage})
        {manaCost > 0 && <span className="ml-1">({manaCost} mana)</span>}
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