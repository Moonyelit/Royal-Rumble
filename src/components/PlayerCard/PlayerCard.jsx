// PlayerCard.jsx
import React from "react";
import ButtonCapacity from "../ButtonCapacity/ButtonCapacity";
import ProgressBar from "../ProgressBar/ProgressBar";
import "./PlayerCard.css";

function PlayerCard({ player }) {
  // Définition des capacités pour chaque joueur
  const abilitiesByPlayer = {
    1: [
      { label: "Capacité 1", attackType: "Attaque", damage: 10, manaCost: 0, icon: "fa-fist-raised" },
      { label: "Capacité 2", attackType: "Protection Sacrée", damage: 0, manaCost: 15, icon: "fa-shield" },
      { label: "Capacité 3", attackType: "Coup Stratégique", damage: 15, manaCost: 10, icon: "fa-chess-knight" },
      { label: "Capacité 4", attackType: "Bouclier Lumineux", damage: 30, manaCost: 30, icon: "fa-sun" },
    ],
    2: [
      { label: "Capacité 1", attackType: "Attaque", damage: 15, manaCost: 0, icon: "fa-fist-raised" },
      { label: "Capacité 2", attackType: "Fracas de Titan", damage: 15, manaCost: 7, icon: "fa-hammer" },
      { label: "Capacité 3", attackType: "Fureur Sauvage", damage: 25, manaCost: 15, icon: "fa-bolt" },
      { label: "Capacité 4", attackType: "Colère Berserk", damage: 40, manaCost: 20, icon: "fa-fire" },
    ],
    3: [
      { label: "Capacité 1", attackType: "Attaque", damage: 7, manaCost: 0, icon: "fa-fist-raised" },
      { label: "Capacité 2", attackType: "Soin Miraculeux", damage: -30, manaCost: 15, icon: "fa-heart", targetType: "ally", needsTargetSelection: true },
      { label: "Capacité 3", attackType: "Jugement Divin", damage: 20, manaCost: 15, icon: "fa-gavel" },
      { label: "Capacité 4", attackType: "Réveil Vital", damage: -15, manaCost: 35, icon: "fa-plus", targetType: "deadAlly", needsTargetSelection: true },
    ],
    4: [
      { label: "Capacité 1", attackType: "Attaque", damage: 3, manaCost: 0, icon: "fa-fist-raised" },
      { label: "Capacité 2", attackType: "Flamme Sombre", damage: 17, manaCost: 9, icon: "fa-fire" },
      { label: "Capacité 3", attackType: "Onde de Ténèbres", damage: 23, manaCost: 18, icon: "fa-wave-square" },
      { label: "Capacité 4", attackType: "Invocation Maléfique", damage: 35, manaCost: 20, icon: "fa-magic" },
    ],
  };

  const abilities = abilitiesByPlayer[player.id] || [];

  return (
    <div className="player-card">
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
              className="ability-button" // On passe la classe pour styliser le bouton
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default PlayerCard;
