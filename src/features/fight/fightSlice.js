import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  players: [
    { name: "Riou", pv: 200, pvMax: 200, mana: 120, manaMax: 50, id: 1 },
    { name: "ViKtor", pv: 220, pvMax: 220, mana: 70, manaMax: 30, id: 2 },
    { name: "Nanami", pv: 150, pvMax: 150, mana: 100, manaMax: 70, id: 3 },
    { name: "Sierra", pv: 130, pvMax: 130, mana: 150, manaMax: 100, id: 4 },
  ],
  monster: {
    name: "Neclord",
    pv: 800,
    pvMax: 800,
  },
  gameStatus: "playing",
  playersWhoActed: [],
  lastAttack: null
};

export const fightSlice = createSlice({
  name: "fight",
  initialState,
  reducers: {
    hitMonster: (state, action) => {
      // Code pour l'action hitMonster
      const { damage, playerId, manaCost } = action.payload;
      
      // Réduire les PV du monstre
      state.monster.pv = Math.max(0, state.monster.pv - damage);
      
      // Réduire le mana du joueur
      const playerIndex = state.players.findIndex(p => p.id === playerId);
      if (playerIndex !== -1) {
        state.players[playerIndex].mana -= manaCost;
        // Marquer le joueur comme ayant agi ce tour
        state.playersWhoActed.push(playerId);
      }
      
      // Vérifier si le monstre est vaincu
      if (state.monster.pv === 0) {
        state.gameStatus = "victory";
      }
    },
    
    hitBack: (state, action) => {
      // Code pour la contre-attaque
      const { damage, playerId } = action.payload;
      
      // Trouver l'index du joueur ciblé
      const playerIndex = state.players.findIndex(p => p.id === playerId);
      
      // Réduire les PV du joueur ciblé
      if (playerIndex !== -1) {
        state.players[playerIndex].pv = Math.max(0, state.players[playerIndex].pv - damage);
      }
      
      // Vérifier si tous les joueurs sont morts
      const allPlayersDead = state.players.every(player => player.pv === 0);
      if (allPlayersDead) {
        state.gameStatus = "defeat";
      }
    },
    
    monsterAttack: (state) => {
      // Code pour l'attaque du monstre
      
      // 30% de chance de rater l'attaque
      const monsterMissesAttack = Math.random() <= 0.3;
      
      if (!monsterMissesAttack) {
        const damage = Math.floor(Math.random() * 11) + 15;
        const alivePlayers = state.players.filter(player => player.pv > 0);
        
        if (alivePlayers.length > 0) {
          const randomIndex = Math.floor(Math.random() * alivePlayers.length);
          const targetPlayerId = alivePlayers[randomIndex].id;
          const playerIndex = state.players.findIndex(p => p.id === targetPlayerId);
          state.players[playerIndex].pv = Math.max(0, state.players[playerIndex].pv - damage);
          
          // Ajouter info pour le message d'attaque
          state.lastAttack = {
            type: "special",
            name: "Étreinte des Abysses",
            targetName: state.players[playerIndex].name,
            damage: damage
          };
        }
      } else {
        // Le monstre rate son attaque
        state.lastAttack = {
          type: "miss",
          name: "Attaque ratée"
        };
      }
      
      // Réinitialiser la liste des joueurs qui ont agi
      state.playersWhoActed = [];
    },
    healAlly: (state, action) => {
      const { allyId, healAmount, casterId, manaCost } = action.payload;
      
      // Trouver l'allié à soigner
      const ally = state.players.find(player => player.id === allyId);
      if (ally) {
        // Appliquer le soin sans dépasser les PV max
        ally.pv = Math.min(ally.pv - healAmount, ally.pvMax);
        
        // Réduire le mana du lanceur
        const caster = state.players.find(player => player.id === casterId);
        if (caster) {
          caster.mana -= manaCost;
        }
        
        // Ajouter un message dans le journal de combat si vous en avez un
        if (state.combatLog) {
          state.combatLog.push(`${caster.name} a soigné ${ally.name} de ${-healAmount} points de vie.`);
        }
      }
    },
    resurrectAlly: (state, action) => {
      const { allyId, resurrectAmount, casterId, manaCost } = action.payload;
      
      // Trouver l'allié à ressusciter
      const ally = state.players.find(player => player.id === allyId);
      if (ally && ally.pv === 0) {
        // Ressusciter l'allié avec la moitié de ses PV max
        ally.pv = resurrectAmount;
        
        // Réduire le mana du lanceur
        const caster = state.players.find(player => player.id === casterId);
        if (caster) {
          caster.mana -= manaCost;
        }
        
        // Marquer le lanceur comme ayant agi ce tour
        if (!state.playersWhoActed.includes(casterId)) {
          state.playersWhoActed.push(casterId);
        }
      }
    },
  }
});

// Export des actions
export const { hitMonster, hitBack, monsterAttack, healAlly, resurrectAlly } = fightSlice.actions;

// Nous exportons le reducer généré automatiquement
export default fightSlice.reducer;