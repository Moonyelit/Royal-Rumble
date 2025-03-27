// PlayerCard.jsx
import React from "react";
import ButtonCapacity from "../ButtonCapacity/ButtonCapacity";
import ProgressBar from "../ProgressBar/ProgressBar";
import "./PlayerCard.css";

function PlayerCard({ player }) {
  // Définition des capacités pour chaque joueur
  const abilitiesByPlayer = {
    1: [
      { label: "Capacité 1", attackType: "Attaque", damage: 15, manaCost: 0, icon: "fa-fist-raised" },
      { label: "Capacité 2", attackType: "Danse des Astres", damage: 25, manaCost: 15, icon: "fa-star" },
      { label: "Capacité 3", attackType: "Coup Stratégique", damage: 20, manaCost: 5, icon: "fa-chess-knight" },
      { label: "Capacité 4", attackType: "Bénédiction Céleste", damage: 50, manaCost: 50, icon: "fa-sun", healAllies: 50, targetType: "enemyAndAllies" },
    ],
    2: [
      { label: "Capacité 1", attackType: "Attaque", damage: 20, manaCost: 0, icon: "fa-fist-raised" },
      { label: "Capacité 2", attackType: "Fracas de Titan", damage: 35, manaCost: 15, icon: "fa-hammer" },
      { label: "Capacité 3", attackType: "Fureur Sauvage", damage: 25, manaCost: 10, icon: "fa-bolt" },
      { label: "Capacité 4", attackType: "Colère Berserk", damage: 40, manaCost: 20, icon: "fa-fire", tauntDuration: 3 },
    ],
    3: [
      { label: "Capacité 1", attackType: "Attaque", damage: 10, manaCost: 0, icon: "fa-fist-raised" },
      { label: "Capacité 2", attackType: "Soin Miraculeux", damage: -30, manaCost: 15, icon: "fa-heart", targetType: "ally", needsTargetSelection: true },
      { label: "Capacité 3", attackType: "Jugement Divin", damage: 20, manaCost: 8, icon: "fa-gavel" },
      { label: "Capacité 4", attackType: "Réveil Vital", damage: -15, manaCost: 35, icon: "fa-plus", targetType: "deadAlly", needsTargetSelection: true },
    ],
    4: [
      { label: "Capacité 1", attackType: "Attaque", damage: 7, manaCost: 0, icon: "fa-fist-raised" },
      { label: "Capacité 2", attackType: "Flamme Sombre", damage: 30, manaCost: 10, icon: "fa-fire" },
      { label: "Capacité 3", attackType: "Onde de Ténèbres", damage: 35, manaCost: 13, icon: "fa-wave-square" },
      { label: "Capacité 4", attackType: "Invocation Maléfique", damage: 40, manaCost: 17, icon: "fa-magic" },
    ],
  };

  const abilities = abilitiesByPlayer[player.id] || [];
  
  // Ajouter une classe pour indiquer si le joueur est mort
  const playerIsDead = player.pv === 0;

  return (
    <div className={`player-card ${playerIsDead ? 'player-dead' : ''}`}>
      <div className="player-card-body">
        <div className="top-row">
          <div className="image-container">
            <img src={player.image || "/placeholder.png"} alt={player.name} />
          </div>
          <div className="infos-container">
            <div className="name-container">{player.name}</div>
            <div className="bars-row">
              <ProgressBar
                pv={player.pv}
                pvMax={player.pvMax}
                faType="fa-heart"
                barName=" PV"
                bgType=""
                className="bars-row-pv"
              />
              <ProgressBar
                pv={player.mana}
                pvMax={player.manaMax}
                faType="fa-fire-alt"
                barName=" Mana"
                bgType=""
                className="bars-row-mana"
              />
            </div>
          </div>
        </div>

        <div className="abilities-container">
          {abilities.map((ability, index) => (
            <ButtonCapacity
              key={index}
              player={player}
              label={ability.label || `Capacité ${index + 1}`}
              attackType={ability.attackType}
              damage={ability.damage}
              manaCost={ability.manaCost}
              icon={ability.icon}
              targetType={ability.targetType}
              needsTargetSelection={ability.needsTargetSelection}
              healAllies={ability.healAllies}
              tauntDuration={ability.tauntDuration}
              className="ability-button"
            />
          ))}
        </div>
      </div>
      
      {/* Ajout d'un élément visuel pour indiquer la mort */}
      {playerIsDead && (
        <div className="death-overlay">
          <i className="fas fa-skull"></i>
        </div>
      )}
    </div>
  );
}

export default PlayerCard;
