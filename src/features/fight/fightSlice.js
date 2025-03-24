import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  players: [
    { name: "Riou", pv: 200, pvMax: 200, mana: 150, manaMax: 150, id: 1 },
    { name: "ViKtor", pv: 220, pvMax: 220, mana: 85, manaMax: 85, id: 2 },
    { name: "Nanami", pv: 150, pvMax: 150, mana: 130, manaMax: 130, id: 3 },
    { name: "Sierra", pv: 130, pvMax: 130, mana: 200, manaMax: 200, id: 4 },
  ],
  monster: {
    name: "Neclord",
    pv: 1500,
    pvMax: 1500,
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
      // Définir les attaques possibles avec leurs pourcentages de chance
      const attacks = [
        { 
          name: "miss", // Rate l'attaque
          chance: 30, // 30% de chance de rater
          execute: () => {
            state.lastAttack = {
              type: "miss",
              name: "Attaque ratée"
            };
          }
        },
        { 
          name: "succionVitale",
          chance: 28, // 28% de chance
          execute: () => {
            // Augmentation: 5-30 PV => 15-40 PV (+10)
            const drainAmount = Math.floor(Math.random() * 26) + 15; // Entre 15 et 40 PV
            const alivePlayers = state.players.filter(player => player.pv > 0);
            
            if (alivePlayers.length > 0) {
              const randomIndex = Math.floor(Math.random() * alivePlayers.length);
              const targetPlayerId = alivePlayers[randomIndex].id;
              const playerIndex = state.players.findIndex(p => p.id === targetPlayerId);
              
              // Calculer les dégâts réels
              const actualDrain = Math.min(drainAmount, state.players[playerIndex].pv);
              
              // Infliger les dégâts au joueur
              state.players[playerIndex].pv = Math.max(0, state.players[playerIndex].pv - actualDrain);
              
              // Soigner Neclord
              state.monster.pv = Math.min(state.monster.pvMax, state.monster.pv + actualDrain);
              
              // Ajouter info pour le message d'attaque
              state.lastAttack = {
                type: "drain",
                name: "Succion vitale",
                targetName: state.players[playerIndex].name,
                damage: actualDrain,
                healAmount: actualDrain
              };
            }
          }
        },
        { 
          name: "etreinteAbysses",
          chance: 30, // 30% de chance
          execute: () => {
            // Augmentation: 15-25 PV => 25-35 PV (+10)
            const damage = Math.floor(Math.random() * 11) + 25; // Entre 25 et 35 PV
            const alivePlayers = state.players.filter(player => player.pv > 0);
            
            if (alivePlayers.length > 0) {
              const randomIndex = Math.floor(Math.random() * alivePlayers.length);
              const targetPlayerId = alivePlayers[randomIndex].id;
              const playerIndex = state.players.findIndex(p => p.id === targetPlayerId);
              state.players[playerIndex].pv = Math.max(0, state.players[playerIndex].pv - damage);
              
              state.lastAttack = {
                type: "special",
                name: "Étreinte des Abysses",
                targetName: state.players[playerIndex].name,
                damage: damage
              };
            }
          }
        },
        { 
          name: "ombresDevorantes",
          chance: 12, // 12% de chance
          execute: () => {
            // Augmentation: 5-10 PV => 15-20 PV par joueur (+10)
            const damagePerPlayer = Math.floor(Math.random() * 6) + 15; // Entre 15 et 20 PV par joueur
            let totalDamage = 0;
            
            state.players.forEach((player, index) => {
              if (player.pv > 0) {
                state.players[index].pv = Math.max(0, player.pv - damagePerPlayer);
                totalDamage += damagePerPlayer;
              }
            });
            
            state.lastAttack = {
              type: "aoe",
              name: "Ombres Dévorantes",
              totalDamage: totalDamage
            };
          }
        }
      ];
      
      // Choisir une attaque en fonction des pourcentages
      const randomValue = Math.random() * 100;
      let cumulativeChance = 0;
      let selectedAttack = null;
      
      for (const attack of attacks) {
        cumulativeChance += attack.chance;
        if (randomValue <= cumulativeChance) {
          selectedAttack = attack;
          break;
        }
      }
      
      // Exécuter l'attaque sélectionnée
      if (selectedAttack) {
        selectedAttack.execute();
      }
      
      // Réinitialiser la liste des joueurs qui ont agi
      state.playersWhoActed = [];
      
      // Vérifier si tous les joueurs sont morts
      const allPlayersDead = state.players.every(player => player.pv === 0);
      if (allPlayersDead) {
        state.gameStatus = "defeat";
      }
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
    autoAttack: (state) => {
      // Pour chaque joueur en vie qui n'a pas encore agi
      state.players.forEach(player => {
        if (player.pv > 0 && !state.playersWhoActed.includes(player.id)) {
          const abilities = getPlayerAbilities(player.id);
          const bestAbility = chooseBestAbility(state, player, abilities);
          
          if (bestAbility) {
            // Exécuter l'action appropriée selon le type de capacité
            if (bestAbility.targetType === "ally" && bestAbility.attackType === "Soin Miraculeux") {
              // Trouver l'allié avec le moins de PV qui n'est pas mort
              const aliveAllies = state.players.filter(p => p.pv > 0 && p.id !== player.id);
              if (aliveAllies.length > 0) {
                const lowestHpAlly = aliveAllies.reduce((prev, curr) => 
                  (prev.pv / prev.pvMax < curr.pv / curr.pvMax) ? prev : curr
                );
                
                // Appliquer le soin
                lowestHpAlly.pv = Math.min(lowestHpAlly.pv - bestAbility.damage, lowestHpAlly.pvMax);
                player.mana -= bestAbility.manaCost;
                state.playersWhoActed.push(player.id);
              }
            } 
            else if (bestAbility.targetType === "deadAlly" && bestAbility.attackType === "Réveil Vital") {
              // Trouver un allié mort
              const deadAlly = state.players.find(p => p.pv === 0);
              if (deadAlly) {
                // Ressusciter l'allié
                deadAlly.pv = Math.floor(deadAlly.pvMax * 0.3); // 30% des PV max
                player.mana -= bestAbility.manaCost;
                state.playersWhoActed.push(player.id);
              }
            }
            else {
              // Attaque normale sur le monstre
              state.monster.pv = Math.max(0, state.monster.pv - bestAbility.damage);
              player.mana -= bestAbility.manaCost;
              state.playersWhoActed.push(player.id);
            }
          }
        }
      });
      
      // Vérifier si le monstre est vaincu
      if (state.monster.pv === 0) {
        state.gameStatus = "victory";
      }
    }
  }
});

// Ajouter cette fonction pour obtenir les capacités de chaque joueur
function getPlayerAbilities(playerId) {
  const abilitiesByPlayer = {
    1: [
      { attackType: "Attaque", damage: 20, manaCost: 0, icon: "fa-fist-raised" }, // +10
      { attackType: "Protection Sacrée", damage: 10, manaCost: 15, icon: "fa-shield" }, // +10
      { attackType: "Coup Stratégique", damage: 25, manaCost: 10, icon: "fa-chess-knight" }, // +10
      { attackType: "Bouclier Lumineux", damage: 40, manaCost: 30, icon: "fa-sun" }, // +10
    ],
    2: [
      { attackType: "Attaque", damage: 25, manaCost: 0, icon: "fa-fist-raised" }, // +10
      { attackType: "Fracas de Titan", damage: 25, manaCost: 7, icon: "fa-hammer" }, // +10
      { attackType: "Fureur Sauvage", damage: 35, manaCost: 15, icon: "fa-bolt" }, // +10
      { attackType: "Colère Berserk", damage: 50, manaCost: 20, icon: "fa-fire" }, // +10
    ],
    3: [
      { attackType: "Attaque", damage: 17, manaCost: 0, icon: "fa-fist-raised" }, // +10
      { 
        attackType: "Soin Miraculeux", 
        damage: -40, // Soigne 40 PV au lieu de 30 (+10)
        manaCost: 15, 
        icon: "fa-heart",
        targetType: "ally", 
        needsTargetSelection: true 
      },
      { attackType: "Jugement Divin", damage: 30, manaCost: 15, icon: "fa-gavel" }, // +10
      { 
        attackType: "Réveil Vital", 
        damage: -25, // Soigne 25 PV au lieu de 15 (+10)
        manaCost: 35, 
        icon: "fa-plus",
        targetType: "deadAlly",
        needsTargetSelection: true 
      },
    ],
    4: [
      { attackType: "Attaque", damage: 13, manaCost: 0, icon: "fa-fist-raised" }, // +10
      { attackType: "Flamme Sombre", damage: 27, manaCost: 9, icon: "fa-fire" }, // +10
      { attackType: "Onde de Ténèbres", damage: 33, manaCost: 18, icon: "fa-wave-square" }, // +10
      { attackType: "Invocation Maléfique", damage: 45, manaCost: 20, icon: "fa-magic" }, // +10
    ],
  };
  
  return abilitiesByPlayer[playerId] || [];
}

// Fonction qui choisit la meilleure capacité selon la situation
function chooseBestAbility(state, player, abilities) {
  // Filtrer les capacités pour lesquelles le joueur a assez de mana
  const affordableAbilities = abilities.filter(ability => ability.manaCost <= player.mana);
  
  if (affordableAbilities.length === 0) return null;
  
  // Vérifier s'il y a un joueur mort et si Nanami peut le ressusciter
  if (player.id === 3 && player.mana >= 35) {
    const deadAlly = state.players.find(p => p.pv === 0);
    if (deadAlly) {
      return affordableAbilities.find(a => a.attackType === "Réveil Vital");
    }
  }
  
  // Vérifier s'il y a un joueur avec moins de 30% de PV et si Nanami peut le soigner
  if (player.id === 3 && player.mana >= 15) {
    const lowHealthAllies = state.players.filter(p => 
      p.pv > 0 && p.id !== player.id && (p.pv / p.pvMax) < 0.3
    );
    if (lowHealthAllies.length > 0) {
      return affordableAbilities.find(a => a.attackType === "Soin Miraculeux");
    }
  }
  
  // Sinon, choisir l'attaque qui fait le plus de dégâts
  // On exclut les capacités de soin/résurrection car elles ont des dégâts négatifs
  const attackAbilities = affordableAbilities.filter(a => !a.targetType || (a.targetType !== "ally" && a.targetType !== "deadAlly"));
  return attackAbilities.reduce((best, current) => 
    (best.damage > current.damage) ? best : current
  );
}

// Export des actions
export const { 
  hitMonster, 
  hitBack, 
  monsterAttack, 
  healAlly, 
  resurrectAlly,
  autoAttack // N'oubliez pas d'exporter la nouvelle action
} = fightSlice.actions;

// Nous exportons le reducer généré automatiquement
export default fightSlice.reducer;