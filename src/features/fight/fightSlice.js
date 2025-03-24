import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  players: [
    { name: "Riou", pv: 150, pvMax: 150, mana: 50, manaMax: 50, id: 1 },
    { name: "Victor", pv: 170, pvMax: 170, mana: 30, manaMax: 30, id: 2 },
    { name: "Jessy", pv: 100, pvMax: 100, mana: 30, manaMax: 30, id: 3 },
    { name: "Jenny", pv: 100, pvMax: 100, mana: 30, manaMax: 30, id: 4 },
  ],
  monster: {
    name: "Crypto",
    pv: 800,
    pvMax: 800,
  },
  gameStatus: "playing", // "playing", "victory", "defeat"
  playersWhoActed: [] // IDs des joueurs qui ont déjà joué ce tour
};

export const fightSlice = createSlice({
  name: "fight",
  initialState,
  reducers: {
    hitMonster: (state, action) => {
      const { damage, playerId, manaCost } = action.payload;

      // Vérifier si ce joueur a déjà agi
      if (!state.playersWhoActed.includes(playerId)) {
        // Ajouter ce joueur à la liste des joueurs qui ont agi
        state.playersWhoActed.push(playerId);
        
        // Appliquer les dégâts au monstre
        state.monster.pv = Math.max(0, state.monster.pv - damage);

        // Réduire le mana du joueur
        if (manaCost > 0) {
          const playerIndex = state.players.findIndex((p) => p.id === playerId);
          if (playerIndex !== -1) {
            state.players[playerIndex].mana = Math.max(
              0,
              state.players[playerIndex].mana - manaCost
            );
          }
        }
        
        // Vérifier si le monstre est vaincu (victoire)
        if (state.monster.pv === 0) {
          state.gameStatus = "victory";
        }
        
        // Réinitialiser les tours si tous les joueurs vivants ont joué
        const alivePlayers = state.players.filter(player => player.pv > 0);
        const allPlayersActed = alivePlayers.every(player => 
          state.playersWhoActed.includes(player.id)
        );
        
        if (allPlayersActed) {
          state.playersWhoActed = [];
        }
      }
    },
    // Reducer hitBack
    hitBack: (state, action) => {
      const { damage, playerId } = action.payload;
      
      // Trouver le joueur à attaquer
      const playerIndex = state.players.findIndex((p) => p.id === playerId);
      
      // Si le joueur existe, on réduit ses PV
      if (playerIndex !== -1) {
        state.players[playerIndex].pv = Math.max(
          0, 
          state.players[playerIndex].pv - damage
        );
      }
      
      // Vérifier si tous les joueurs sont morts (défaite)
      const allPlayersDead = state.players.every(player => player.pv === 0);
      if (allPlayersDead) {
        state.gameStatus = "defeat";
      }
    },
  },
});

// Export des actions
export const { hitMonster, hitBack, resetGame } = fightSlice.actions;

// Nous exportons le reducer généré automatiquement
export default fightSlice.reducer;