// BattleScene.jsx
import React from "react";
import { useSelector } from "react-redux";
import PlayerList from "../PlayerList/PlayerList";
import ProgressBar from "../ProgressBar/ProgressBar";
import CombatLog from "../CombatLog/CombatLog";
import AutoAttackButton from "../AutoAttackButton/AutoAttackButton";
import MusicControl from "../MusicControl/MusicControl"; // Nouvel import
import Neclord from "../../../public/Neclord/NeclordGif.gif";
import RiouGif from "../../../public/Riou/RiouGif.gif";
import NanamiGif from "../../../public/Sierra/SierraGif.gif";
import ViktorGif from "../../../public/Viktor/ViktorGif.gif";
import SierraGif from "../../../public/Nanami/NanamiGif.gif";

import "./BattleScene.css";

function BattleScene() {
  // Récupération du monstre
  const monster = useSelector((state) => state.fight.monster);

  return (
    <div className="battle-scene">
      {/* Contrôle de la musique */}
      <MusicControl />

      {/* Info du boss en haut */}
      <div className="boss-info">
        <h1>{monster.name}</h1>
        <div className="boss-hp">
          <ProgressBar
            pv={monster.pv}
            pvMax={monster.pvMax}
            faType="fa-heart"
            barName=" PV"
            bgType="bg-danger"
          />
        </div>
      </div>

      {/* Image du monstre au centre */}
      <img className="monster-image" src={Neclord} alt={monster.name} />

      <div className="Heros-sections">
        <img className="Riou-image" src={RiouGif} alt="Riou" />

        <img className="Viktor-image" src={ViktorGif} alt="Viktor" />

        <img className="Sierra-image" src={SierraGif} alt="Sierra" />

        <img className="Nanami-image" src={NanamiGif} alt="Nanami" />


      </div>

      {/* Log sur la droite */}
      <div className="combat-log-container">
        <CombatLog />
      </div>

      {/* Bouton d'auto-attaque sous le journal de combat */}
      <div className="auto-attack-wrapper">
        <AutoAttackButton />
      </div>

      {/* Joueurs en bas */}
      <div className="players-row">
        <PlayerList />
      </div>
    </div>
  );
}

export default BattleScene;
