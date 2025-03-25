// features/fight/fightSlice.js
import { createSlice } from "@reduxjs/toolkit";
import RiouImg from "../../../public/Riou/RiouImg.png";
import ViktorImg from "../../../public/Viktor/ViktorImg.png";
import NanamiImg from "../../../public/Nanami/NanamiImg.png";
import SierraImg from "../../../public/Sierra/SierraImg.png";

const initialState = {
  players: [
    { name: "Riou", pv: 200, pvMax: 200, mana: 150, manaMax: 150, id: 1, image: RiouImg },
    { name: "ViKtor", pv: 220, pvMax: 220, mana: 85, manaMax: 85, id: 2, image: ViktorImg },
    { name: "Nanami", pv: 150, pvMax: 150, mana: 130, manaMax: 130, id: 3, image: NanamiImg },
    { name: "Sierra", pv: 130, pvMax: 130, mana: 200, manaMax: 200, id: 4, image: SierraImg },
  ],
  monster: {
    name: "Neclord",
    pv: 1500,
    pvMax: 1500,
  },
  gameStatus: "playing",
  playersWhoActed: [],
  lastAttack: null,
};

export const fightSlice = createSlice({
  name: "fight",
  initialState,
  reducers: {
    hitMonster: (state, action) => {
      const { damage, playerId, manaCost } = action.payload;
      // Réduire les PV du monstre
      state.monster.pv = Math.max(0, state.monster.pv - damage);

      // Réduire le mana du joueur
      const playerIndex = state.players.findIndex((p) => p.id === playerId);
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
      const { damage, playerId } = action.payload;
      const playerIndex = state.players.findIndex((p) => p.id === playerId);
      if (playerIndex !== -1) {
        state.players[playerIndex].pv = Math.max(
          0,
          state.players[playerIndex].pv - damage
        );
      }
      const allPlayersDead = state.players.every((player) => player.pv === 0);
      if (allPlayersDead) {
        state.gameStatus = "defeat";
      }
    },

    monsterAttack: (state) => {
      const attacks = [
        {
          name: "miss",
          chance: 30,
          execute: () => {
            state.lastAttack = {
              type: "miss",
              name: "Attaque ratée",
            };
          },
        },
        {
          name: "succionVitale",
          chance: 28,
          execute: () => {
            const drainAmount = Math.floor(Math.random() * 26) + 15;
            const alivePlayers = state.players.filter((player) => player.pv > 0);
            if (alivePlayers.length > 0) {
              const randomIndex = Math.floor(Math.random() * alivePlayers.length);
              const targetPlayerId = alivePlayers[randomIndex].id;
              const playerIndex = state.players.findIndex(
                (p) => p.id === targetPlayerId
              );
              const actualDrain = Math.min(
                drainAmount,
                state.players[playerIndex].pv
              );
              state.players[playerIndex].pv = Math.max(
                0,
                state.players[playerIndex].pv - actualDrain
              );
              state.monster.pv = Math.min(
                state.monster.pvMax,
                state.monster.pv + actualDrain
              );
              state.lastAttack = {
                type: "drain",
                name: "Succion vitale",
                targetName: state.players[playerIndex].name,
                damage: actualDrain,
                healAmount: actualDrain,
              };
            }
          },
        },
        {
          name: "etreinteAbysses",
          chance: 30,
          execute: () => {
            const damage = Math.floor(Math.random() * 11) + 25;
            const alivePlayers = state.players.filter((player) => player.pv > 0);
            if (alivePlayers.length > 0) {
              const randomIndex = Math.floor(Math.random() * alivePlayers.length);
              const targetPlayerId = alivePlayers[randomIndex].id;
              const playerIndex = state.players.findIndex(
                (p) => p.id === targetPlayerId
              );
              state.players[playerIndex].pv = Math.max(
                0,
                state.players[playerIndex].pv - damage
              );
              state.lastAttack = {
                type: "special",
                name: "Étreinte des Abysses",
                targetName: state.players[playerIndex].name,
                damage: damage,
              };
            }
          },
        },
        {
          name: "ombresDevorantes",
          chance: 12,
          execute: () => {
            const damagePerPlayer = Math.floor(Math.random() * 6) + 15;
            let totalDamage = 0;
            state.players.forEach((player, index) => {
              if (player.pv > 0) {
                state.players[index].pv = Math.max(
                  0,
                  player.pv - damagePerPlayer
                );
                totalDamage += damagePerPlayer;
              }
            });
            state.lastAttack = {
              type: "aoe",
              name: "Ombres Dévorantes",
              totalDamage: totalDamage,
            };
          },
        },
      ];

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

      if (selectedAttack) {
        selectedAttack.execute();
      }

      // Réinitialiser la liste des joueurs qui ont agi
      state.playersWhoActed = [];

      // Vérifier si tous les joueurs sont morts
      const allPlayersDead = state.players.every((player) => player.pv === 0);
      if (allPlayersDead) {
        state.gameStatus = "defeat";
      }
    },

    healAlly: (state, action) => {
      const { allyId, healAmount, casterId, manaCost } = action.payload;
      const ally = state.players.find((player) => player.id === allyId);
      if (ally) {
        ally.pv = Math.min(ally.pv - healAmount, ally.pvMax);
        const caster = state.players.find((player) => player.id === casterId);
        if (caster) {
          caster.mana -= manaCost;
        }
        // (Optionnel) On pourrait ajouter un message dans le log
      }
    },

    resurrectAlly: (state, action) => {
      const { allyId, resurrectAmount, casterId, manaCost } = action.payload;
      const ally = state.players.find((player) => player.id === allyId);
      if (ally && ally.pv === 0) {
        ally.pv = resurrectAmount;
        const caster = state.players.find((player) => player.id === casterId);
        if (caster) {
          caster.mana -= manaCost;
        }
        if (!state.playersWhoActed.includes(casterId)) {
          state.playersWhoActed.push(casterId);
        }
      }
    },

    autoAttack: (state) => {
      state.players.forEach((player) => {
        if (player.pv > 0 && !state.playersWhoActed.includes(player.id)) {
          const abilities = getPlayerAbilities(player.id);
          const bestAbility = chooseBestAbility(state, player, abilities);
          if (bestAbility) {
            if (
              bestAbility.targetType === "ally" &&
              bestAbility.attackType === "Soin Miraculeux"
            ) {
              const aliveAllies = state.players.filter(
                (p) => p.pv > 0 && p.id !== player.id
              );
              if (aliveAllies.length > 0) {
                const lowestHpAlly = aliveAllies.reduce((prev, curr) =>
                  prev.pv / prev.pvMax < curr.pv / curr.pvMax ? prev : curr
                );
                lowestHpAlly.pv = Math.min(
                  lowestHpAlly.pv - bestAbility.damage,
                  lowestHpAlly.pvMax
                );
                player.mana -= bestAbility.manaCost;
                state.playersWhoActed.push(player.id);
              }
            } else if (
              bestAbility.targetType === "deadAlly" &&
              bestAbility.attackType === "Réveil Vital"
            ) {
              const deadAlly = state.players.find((p) => p.pv === 0);
              if (deadAlly) {
                deadAlly.pv = Math.floor(deadAlly.pvMax * 0.3);
                player.mana -= bestAbility.manaCost;
                state.playersWhoActed.push(player.id);
              }
            } else {
              state.monster.pv = Math.max(
                0,
                state.monster.pv - bestAbility.damage
              );
              player.mana -= bestAbility.manaCost;
              state.playersWhoActed.push(player.id);
            }
          }
        }
      });

      if (state.monster.pv === 0) {
        state.gameStatus = "victory";
      }
    },
  },
});

// Fonctions d'aide

function getPlayerAbilities(playerId) {
  const abilitiesByPlayer = {
    1: [
      {
        attackType: "Attaque",
        damage: 20,
        manaCost: 0,
        icon: "fa-fist-raised",
        className: "ability-button" // Ajout de la classe CSS
      },
      {
        attackType: "e",
        damage: 10,
        manaCost: 15,
        icon: "fa-shield",
        className: "ability-button" // Ajout de la classe CSS
      },
      {
        attackType: "Coup Stratégique",
        damage: 25,
        manaCost: 10,
        icon: "fa-chess-knight",
        className: "ability-button" // Ajout de la classe CSS
      },
      {
        attackType: "Bouclier Lumineux",
        damage: 40,
        manaCost: 30,
        icon: "fa-sun",
        className: "ability-button" // Ajout de la classe CSS
      },
    ],
    2: [
      {
        attackType: "Attaque",
        damage: 25,
        manaCost: 0,
        icon: "fa-fist-raised",
        className: "ability-button" // Ajout de la classe CSS
      },
      {
        attackType: "Fracas de Titan",
        damage: 25,
        manaCost: 7,
        icon: "fa-hammer",
        className: "ability-button" // Ajout de la classe CSS
      },
      {
        attackType: "Fureur Sauvage",
        damage: 35,
        manaCost: 15,
        icon: "fa-bolt",
        className: "ability-button" // Ajout de la classe CSS
      },
      {
        attackType: "Colère Berserk",
        damage: 50,
        manaCost: 20,
        icon: "fa-fire",
        className: "ability-button" // Ajout de la classe CSS
      },
    ],
    3: [
      {
        attackType: "Attaque",
        damage: 17,
        manaCost: 0,
        icon: "fa-fist-raised",
        className: "ability-button" // Ajout de la classe CSS
      },
      {
        attackType: "Soin Miraculeux",
        damage: -40,
        manaCost: 15,
        icon: "fa-heart",
        targetType: "ally",
        needsTargetSelection: true,
        className: "ability-button" // Ajout de la classe CSS
      },
      {
        attackType: "Jugement Divin",
        damage: 30,
        manaCost: 15,
        icon: "fa-gavel",
        className: "ability-button" // Ajout de la classe CSS
      },
      {
        attackType: "Réveil Vital",
        damage: -25,
        manaCost: 35,
        icon: "fa-plus",
        targetType: "deadAlly",
        needsTargetSelection: true,
        className: "ability-button" // Ajout de la classe CSS
      },
    ],
    4: [
      {
        attackType: "Attaque",
        damage: 13,
        manaCost: 0,
        icon: "fa-fist-raised",
        className: "ability-button" // Ajout de la classe CSS
      },
      {
        attackType: "Flamme Sombre",
        damage: 27,
        manaCost: 9,
        icon: "fa-fire",
        className: "ability-button" // Ajout de la classe CSS
      },
      {
        attackType: "Onde de Ténèbres",
        damage: 33,
        manaCost: 18,
        icon: "fa-wave-square",
        className: "ability-button" // Ajout de la classe CSS
      },
      {
        attackType: "Invocation Maléfique",
        damage: 45,
        manaCost: 20,
        icon: "fa-magic",
        className: "ability-button" // Ajout de la classe CSS
      },
    ],
  };
  return abilitiesByPlayer[playerId] || [];
}

function chooseBestAbility(state, player, abilities) {
  const affordableAbilities = abilities.filter(
    (ability) => ability.manaCost <= player.mana
  );
  if (affordableAbilities.length === 0) return null;
  if (player.id === 3 && player.mana >= 35) {
    const deadAlly = state.players.find((p) => p.pv === 0);
    if (deadAlly) {
      return affordableAbilities.find((a) => a.attackType === "Réveil Vital");
    }
  }
  if (player.id === 3 && player.mana >= 15) {
    const lowHealthAllies = state.players.filter(
      (p) => p.pv > 0 && p.id !== player.id && p.pv / p.pvMax < 0.3
    );
    if (lowHealthAllies.length > 0) {
      return affordableAbilities.find((a) => a.attackType === "Soin Miraculeux");
    }
  }
  const attackAbilities = affordableAbilities.filter(
    (a) =>
      !a.targetType ||
      (a.targetType !== "ally" && a.targetType !== "deadAlly")
  );
  return attackAbilities.reduce((best, current) =>
    best.damage > current.damage ? best : current
  );
}

export const {
  hitMonster,
  hitBack,
  monsterAttack,
  healAlly,
  resurrectAlly,
  autoAttack,
} = fightSlice.actions;

export default fightSlice.reducer;
