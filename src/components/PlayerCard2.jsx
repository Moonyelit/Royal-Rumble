// PlayerCard.jsx
import ButtonCapacity from "./ButtonCapacity/ButtonCapacity";
import ProgressBar from "./ProgressBar/ProgressBar";

function PlayerCard({ player }) {
  // On définit les attaques propres à chaque personnage par leur id
  const abilitiesByPlayer = {
    1: [
      { attackType: "Attaque", damage: 18, manaCost: 0, icon: "fa-fist-raised" },
      { attackType: "Protection Sacrée", damage: 0, manaCost: 15, icon: "fa-shield" },
      { attackType: "Coup Stratégique", damage: 20, manaCost: 10, icon: "fa-chess-knight" },      
      { attackType: "Bouclier Lumineux", damage: 35, manaCost: 30, icon: "fa-sun" },
    ],
    2: [
      { attackType: "Attaque", damage: 24, manaCost: 0, icon: "fa-fist-raised" },
      { attackType: "Fracas de Titan", damage: 20, manaCost: 7, icon: "fa-hammer" },
      { attackType: "Fureur Sauvage", damage: 30, manaCost: 15, icon: "fa-bolt" },
      { attackType: "Colère Berserk", damage: 48, manaCost: 20, icon: "fa-fire" },
    ],
    3: [
      { attackType: "Attaque", damage: 12, manaCost: 0, icon: "fa-fist-raised" },
      { 
        attackType: "Soin Miraculeux", 
        damage: -35, 
        manaCost: 15, 
        icon: "fa-heart",
        targetType: "ally", 
        needsTargetSelection: true 
      },
      { attackType: "Jugement Divin", damage: 25, manaCost: 15, icon: "fa-gavel" },
      { 
        attackType: "Réveil Vital", 
        damage: -20, // Cette valeur sera ignorée, on utilisera plutôt 50% des PV max
        manaCost: 35, 
        icon: "fa-plus",
        targetType: "deadAlly", // Nouveau type de cible spécifique aux alliés morts
        needsTargetSelection: true 
      },
    ],
    4: [
      { attackType: "Attaque", damage: 15, manaCost: 0, icon: "fa-fist-raised" },
      { attackType: "Flamme Sombre", damage: 22, manaCost: 9, icon: "fa-fire" },
      { attackType: "Onde de Ténèbres", damage: 28, manaCost: 18, icon: "fa-wave-square" },
      { attackType: "Invocation Maléfique", damage: 42, manaCost: 20, icon: "fa-magic" },
    ],
  };

  return (
    <div
      key={player.id}
      className="col-sm-3 card center"
      id={`joueur${player.id}`}
    >
      <div className="card-body text-center">
        <h5 className="card-title">{player.name}</h5>
        <ProgressBar
          pv={player.pv}
          pvMax={player.pvMax}
          faType="fa-heart"
          barName=" : pv "
          bgType="bg-danger"
        />
        <ProgressBar
          pv={player.mana}
          pvMax={player.manaMax}
          faType="fa-fire-alt"
          barName=" : mana "
        />

        <span className="badge badge-danger ml-2" id={`degatSpanJ${player.id}`}></span>
        <div className="row">
          <div>
            {abilitiesByPlayer[player.id].map((ability, index) => (
              <ButtonCapacity
                key={index}
                player={player}
                attackType={ability.attackType}
                damage={ability.damage}
                manaCost={ability.manaCost}
                icon={ability.icon}
                targetType={ability.targetType} // Ajoutez ces nouvelles props
                needsTargetSelection={ability.needsTargetSelection} // Ajoutez ces nouvelles props
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlayerCard;
