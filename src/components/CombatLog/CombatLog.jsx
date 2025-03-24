import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

function CombatLog() {
  const [message, setMessage] = useState("");
  const lastAttack = useSelector(state => state.fight.lastAttack);
  
  useEffect(() => {
    if (lastAttack) {
      let newMessage = "";
      
      switch(lastAttack.type) {
        case "basic":
          newMessage = `Neclord utilise ${lastAttack.name} sur ${lastAttack.targetName} et inflige ${lastAttack.damage} points de dégâts!`;
          break;
        case "aoe":
          newMessage = `Neclord lance ${lastAttack.name} et attaque tous les héros, infligeant un total de ${lastAttack.totalDamage} points de dégâts!`;
          break;
        case "special":
          newMessage = `Neclord déchaîne ${lastAttack.name} sur ${lastAttack.targetName} et inflige ${lastAttack.damage} points de dégâts dévastateurs!`;
          break;
        case "drain":
          newMessage = `Neclord utilise ${lastAttack.name} sur ${lastAttack.targetName}, absorbe ${lastAttack.damage} points de vie et se régénère de ${lastAttack.healAmount} PV!`;
          break;
        case "miss":
          newMessage = `Neclord tente une attaque mais la rate complètement!`;
          break;
        default:
          newMessage = "";
      }
      
      setMessage(newMessage);
      
      // Effacer le message après 3 secondes
      const timer = setTimeout(() => {
        setMessage("");
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [lastAttack]);
  
  return (
    <div className="combat-log">
      {message && (
        <div className="alert alert-danger">
          {message}
        </div>
      )}
    </div>
  );
}

export default CombatLog;