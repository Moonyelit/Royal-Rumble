import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';

function CombatLog() {
  const [messages, setMessages] = useState([]);
  const messagesRef = useRef(messages); // Référence stable pour éviter les dépendances cycliques
  const lastAttack = useSelector(state => state.fight.lastAttack);
  const gameStatus = useSelector(state => state.fight.gameStatus);
  
  // Mettre à jour la référence quand messages change
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  
  // Utiliser useCallback sans dépendre de messages directement
  const addMessage = useCallback((text, type = "info") => {
    if (!text) return; // Ne pas ajouter de message vide
    
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
    
    setMessages(prev => {
      // Garder un maximum de 10 messages
      const updated = [newMessage, ...prev];
      if (updated.length > 10) return updated.slice(0, 10);
      return updated;
    });
  }, []); // Dépendance vide pour éviter les re-créations inutiles
  
  // Effet pour ajouter un message d'attaque
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
  
  // Effet pour les messages de statut de jeu
  useEffect(() => {
    if (gameStatus === "defeat") {
      addMessage("DÉFAITE ! Tous les joueurs sont morts.", "danger");
    } else if (gameStatus === "victory") {
      addMessage("VICTOIRE ! Le monstre a été vaincu !", "success");
    }
  }, [gameStatus, addMessage]);
  
  // Exposer la fonction addMessage globalement pour qu'elle soit accessible
  // depuis d'autres composants
  useEffect(() => {
    // Assigner la fonction à window
    window.addCombatLogMessage = (text, type) => {
      if (text) addMessage(text, type);
    };
    
    // Nettoyer lors du démontage du composant
    return () => {
      delete window.addCombatLogMessage;
    };
  }, [addMessage]);
  
  // Rendu du composant
  return (
    <div className="combat-log">
      {Array.isArray(messages) && messages.map(msg => (
        <div key={msg.id} className={`alert alert-${msg.type} mb-2`} style={{fontSize: '0.9rem'}}>
          <small>{msg.timestamp}</small>: {msg.text}
        </div>
      ))}
    </div>
  );
}

export default CombatLog;