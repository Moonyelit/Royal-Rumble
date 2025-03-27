import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';

function CombatLog() {
  const [messages, setMessages] = useState([]);
  const messagesRef = useRef(messages);
  const lastAttack = useSelector(state => state.fight.lastAttack);
  const gameStatus = useSelector(state => state.fight.gameStatus);
  const logContainerRef = useRef(null);
  
  // Mettre à jour la référence quand messages change
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  
  // Fonction pour ajouter un message
  const addMessage = useCallback((text, type = "info") => {
    if (!text) return;
    
    // Vérifier si un message identique existe déjà dans les 2 dernières secondes
    const now = Date.now();
    const isDuplicate = messagesRef.current.some(msg => 
      msg.text === text && 
      (now - msg.rawTimestamp) < 2000 && 
      msg.type === type
    );
    
    // Si c'est un doublon, ne pas l'ajouter
    if (isDuplicate) return;
    
    const newMessage = {
      id: now,
      text,
      type,
      rawTimestamp: now,
      timestamp: new Date().toLocaleTimeString()
    };
    
    // Ajouter explicitement le nouveau message au début du tableau
    setMessages(prev => {
      const updated = [newMessage, ...prev];
      // Limiter à 10 messages maximum
      return updated.slice(0, 10);
    });
  }, []);

  // Gestion des messages d'attaque - code inchangé
  useEffect(() => {
    if (lastAttack && typeof lastAttack === 'object') {
      let newMessage = "";
      
      try {
        switch(lastAttack.type) {
          case "basic":
            if (lastAttack.name && lastAttack.targetName && lastAttack.damage !== undefined) {
              newMessage = `Neclord utilise ${lastAttack.name} sur ${lastAttack.targetName} et inflige ${lastAttack.damage} points de dégâts!`;
            }
            break;
          case "aoe":
            if (lastAttack.name && lastAttack.totalDamage !== undefined) {
              newMessage = `Neclord lance ${lastAttack.name} et attaque tous les héros, infligeant un total de ${lastAttack.totalDamage} points de dégâts!`;
            }
            break;
          case "special":
            if (lastAttack.name && lastAttack.targetName && lastAttack.damage !== undefined) {
              newMessage = `Neclord déchaîne ${lastAttack.name} sur ${lastAttack.targetName} et inflige ${lastAttack.damage} points de dégâts dévastateurs!`;
            }
            break;
          case "drain":
            if (lastAttack.name && lastAttack.targetName && lastAttack.damage !== undefined && lastAttack.healAmount !== undefined) {
              newMessage = `Neclord utilise ${lastAttack.name} sur ${lastAttack.targetName}, absorbe ${lastAttack.damage} points de vie et se régénère de ${lastAttack.healAmount} PV!`;
            }
            break;
          case "miss":
            newMessage = `Neclord tente une attaque mais la rate complètement!`;
            break;
          case "playerAttack":
            if (lastAttack.name && lastAttack.attackerName && lastAttack.damage !== undefined) {
              newMessage = `${lastAttack.attackerName} attaque Neclord avec ${lastAttack.name} et inflige ${lastAttack.damage} dégâts!`;
            }
            break;
          case "heal":
            if (lastAttack.name && lastAttack.healerName && lastAttack.targetName && lastAttack.healAmount !== undefined) {
              newMessage = `${lastAttack.healerName} utilise ${lastAttack.name} sur ${lastAttack.targetName} et restaure ${lastAttack.healAmount} points de vie!`;
            }
            break;
          case "resurrect":
            if (lastAttack.name && lastAttack.healerName && lastAttack.targetName && lastAttack.healAmount !== undefined) {
              newMessage = `${lastAttack.healerName} utilise ${lastAttack.name} sur ${lastAttack.targetName} et le ressuscite avec ${lastAttack.healAmount} points de vie!`;
            }
            break;
          default:
            newMessage = "";
        }
      } catch (error) {
        console.error("Erreur lors du traitement de l'attaque:", error);
      }
          
      if (newMessage) {
        addMessage(newMessage, "danger");
      }
    }
  }, [lastAttack, addMessage]);
  
  // Messages de statut du jeu - code inchangé
  useEffect(() => {
    if (gameStatus === "defeat") {
      addMessage("DÉFAITE ! Tous les joueurs sont morts.", "danger");
    } else if (gameStatus === "victory") {
      addMessage("VICTOIRE ! Le monstre a été vaincu !", "success");
    }
  }, [gameStatus, addMessage]);
  
  // Exposer la fonction addMessage globalement - code inchangé
  useEffect(() => {
    window.addCombatLogMessage = (text, type) => {
      if (text) addMessage(text, type);
    };
    
    return () => {
      delete window.addCombatLogMessage;
    };
  }, [addMessage]);
  
  // Rendu du composant avec ordre des messages garanti
  return (
    <div className="combat-log" ref={logContainerRef}>
      {/* Afficher les messages dans l'ordre où ils sont dans le state (les plus récents d'abord) */}
      {Array.isArray(messages) && messages.map(msg => (
        <div key={msg.id} className={`alert alert-${msg.type} mb-2`} style={{fontSize: '0.9rem'}}>
          <small>{msg.timestamp}</small>: {msg.text}
        </div>
      ))}
    </div>
  );
}

export default CombatLog;