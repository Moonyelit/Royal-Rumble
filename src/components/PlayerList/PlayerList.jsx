// PlayerList.jsx
import React from "react";
import { useSelector } from "react-redux";
import PlayerCard from "../PlayerCard/PlayerCard";

function PlayerList() {
  const players = useSelector((state) => state.fight.players);

  return (
    <>
      {players.map((player) => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </>
  );
}

export default PlayerList;
