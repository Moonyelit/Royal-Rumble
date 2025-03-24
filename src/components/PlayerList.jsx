import React from "react";
import { useSelector } from "react-redux";
import PlayerCard from "./PlayerCard";

function PlayerList() {
  const players = useSelector((state) => state.fight.players);

  return (
    <div className="row">
      {players.map((player) => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </div>
  );
}

export default PlayerList;
