// features/fight/fightSlice.js
import { createSlice } from "@reduxjs/toolkit";
import RiouImg from "../../../public/Riou/RiouImg.png";
import ViktorImg from "../../../public/Viktor/ViktorImg.png";
import NanamiImg from "../../../public/Nanami/NanamiImg.png";
import SierraImg from "../../../public/Sierra/SierraImg.png";

const initialState = {
  players: [
    { name: "Riou", pv: 230, pvMax: 230, mana: 170, manaMax: 170, id: 1, image: RiouImg },
    { name: "ViKtor", pv: 250, pvMax: 250, mana: 100, manaMax: 100, id: 2, image: ViktorImg },
    { name: "Nanami", pv: 180, pvMax: 180, mana: 170, manaMax: 170, id: 3, image: NanamiImg },
    { name: "Sierra", pv: 150, pvMax: 150, mana: 230, manaMax: 230, id: 4, image: SierraImg },
  ],
  monster: {
    name: "Neclord",
    pv: 1500,
    pvMax: 1500,
  },
  gameStatus: "playing",
  playersWhoActed: [],
  lastAttack: null,
  tauntedPlayerId: null,  
  tauntRemainingTurns: 0, 
};

export const fightSlice = createSlice({
  name: "fight",
  initialState,
  reducers: {
    hitMonster: (state, action) => {
      const { damage, playerId, manaCost, healAllies, targetType, tauntDuration } = action.payload;
      
      // Réduire les PV du monstre
      state.monster.pv = Math.max(0, state.monster.pv - damage);

      // Si la capacité provoque le monstre
      if (tauntDuration) {
        state.tauntedPlayerId = playerId;
        state.tauntRemainingTurns = tauntDuration;
        
        // Message dans le journal de combat (si implémenté ailleurs)
        if (window.addCombatLogMessage) {
          const player = state.players.find(p => p.id === playerId);
          window.addCombatLogMessage(
            `${player.name} provoque Neclord qui va le cibler pendant ${tauntDuration} tours!`, 
            "warning"
          );
        }
      }

      // Soigner tous les alliés si la capacité le permet
      if (healAllies && targetType === "enemyAndAllies") {
        state.players.forEach(player => {
          // Ne pas soigner le joueur qui lance l'attaque et uniquement les joueurs vivants
          if (player.id !== playerId && player.pv > 0) {
            player.pv = Math.min(player.pvMax, player.pv + healAllies);
          }
        });
      }

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
      // Réinitialiser les actions des joueurs pour le tour suivant
      state.playersWhoActed = [];
      
      // Si un joueur a attiré l'attention du monstre
      if (state.tauntedPlayerId !== null && state.tauntRemainingTurns > 0) {
        // Attaquer spécifiquement ce joueur
        const targetIndex = state.players.findIndex(p => p.id === state.tauntedPlayerId);
        if (targetIndex !== -1 && state.players[targetIndex].pv > 0) {
          // Le monstre attaque le joueur taunté
          const damage = Math.floor(Math.random() * 16) + 10; // 10-25 points de dégâts
          state.players[targetIndex].pv = Math.max(0, state.players[targetIndex].pv - damage);
          
          // Mise à jour de la dernière attaque
          state.lastAttack = {
            targetId: state.tauntedPlayerId,
            damage: damage
          };
          
          // Réduire le compteur de tours de provocation
          state.tauntRemainingTurns--;
          
          // Si le compteur atteint zéro, réinitialiser la cible
          if (state.tauntRemainingTurns === 0) {
            state.tauntedPlayerId = null;
          }
          
          return; // Ne pas continuer avec l'attaque normale
        }
      }
      
      // Si pas de joueur taunté ou s'il est mort, attaque normale
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
        // Correction ici: ajouter les PV au lieu de les soustraire
        ally.pv = Math.min(ally.pv + healAmount, ally.pvMax);
        const caster = state.players.find((player) => player.id === casterId);
        if (caster) {
          caster.mana -= manaCost;
        }
        // Ajouter le joueur à la liste de ceux qui ont agi
        if (!state.playersWhoActed.includes(casterId)) {
          state.playersWhoActed.push(casterId);
        }
      }
    },

    resurrectAlly: (state, action) => {
      const { allyId, healAmount, casterId, manaCost } = action.payload;
      
      // Ressusciter l'allié
      const allyIndex = state.players.findIndex(p => p.id === allyId);
      if (allyIndex !== -1 && state.players[allyIndex].pv === 0) {
        // Donner la moitié des PV max
        state.players[allyIndex].pv = healAmount;
      }
      
      // Réduire le mana du lanceur
      const casterIndex = state.players.findIndex(p => p.id === casterId);
      if (casterIndex !== -1) {
        state.players[casterIndex].mana -= manaCost;
        // Marquer le joueur comme ayant agi
        state.playersWhoActed.push(casterId);
      }
    },

    autoAttack: (state) => {
      // Pour chaque joueur vivant qui n'a pas encore agi
      state.players.forEach((player) => {
        // Ne pas traiter les joueurs qui ont déjà agi ou qui sont morts
        if (state.playersWhoActed.includes(player.id) || player.pv === 0) {
          return;
        }
        
        // Variables pour stocker les informations sur l'attaque
        let attackInfo = null;
        
        // Choisir différentes attaques selon le joueur
        switch(player.id) {
          case 1: // Riou
            if (player.mana >= 30) {
              // Attaque puissante
              attackInfo = {
                name: "Lame Brillante", 
                damage: 20, 
                manaCost: 30
              };
            } else {
              // Attaque de base
              attackInfo = {
                name: "Attaque Rapide", 
                damage: 10, 
                manaCost: 0
              };
            }
            break;
            
          case 2: // ViKtor
            if (player.mana >= 25) {
              // Attaque puissante
              attackInfo = {
                name: "Coup de Maître", 
                damage: 25, 
                manaCost: 25
              };
            } else {
              // Attaque de base
              attackInfo = {
                name: "Frappe Directe", 
                damage: 15, 
                manaCost: 0
              };
            }
            break;
            
          case 3: // Nanami
            // Vérifier si quelqu'un a besoin de soin
            const needsHealing = state.players.some(p => p.pv > 0 && p.pv < p.pvMax * 0.5);
            const anyoneDead = state.players.some(p => p.pv === 0);
            
            if (anyoneDead && player.mana >= 40) {
              // Résurrection
              const deadPlayer = state.players.find(p => p.pv === 0);
              attackInfo = {
                type: "resurrect",
                name: "Souffle de Vie",
                targetId: deadPlayer.id,
                healAmount: Math.floor(deadPlayer.pvMax * 0.3),
                manaCost: 40,
                targetName: deadPlayer.name
              };
            } else if (needsHealing && player.mana >= 25) {
              // Soin
              const playerToHeal = state.players.find(p => p.pv > 0 && p.pv < p.pvMax * 0.5);
              attackInfo = {
                type: "heal",
                name: "Vague Guérisseuse",
                targetId: playerToHeal.id,
                healAmount: 40,
                manaCost: 25,
                targetName: playerToHeal.name
              };
            } else if (player.mana >= 15) {
              // Attaque
              attackInfo = {
                name: "Frappe Aquatique", 
                damage: 12, 
                manaCost: 15
              };
            } else {
              // Attaque de base
              attackInfo = {
                name: "Tourbillon", 
                damage: 8, 
                manaCost: 0
              };
            }
            break;
            
          case 4: // Sierra
            if (player.mana >= 50) {
              // Attaque puissante
              attackInfo = {
                name: "Morsure Vampirique", 
                damage: 35, 
                manaCost: 50
              };
            } else if (player.mana >= 20) {
              // Attaque moyenne
              attackInfo = {
                name: "Griffes des Ténèbres", 
                damage: 18, 
                manaCost: 20
              };
            } else {
              // Attaque de base
              attackInfo = {
                name: "Frappe Nocturne", 
                damage: 12, 
                manaCost: 0
              };
            }
            break;
        }
        
        if (attackInfo) {
          // Trouver l'index du joueur pour les mises à jour
          const playerIndex = state.players.findIndex(p => p.id === player.id);
          
          // Exécuter l'action selon le type
          if (attackInfo.type === "heal") {
            // Soin - utiliser l'ID du joueur cible pour le trouver dans le tableau
            const targetIndex = state.players.findIndex(p => p.id === attackInfo.targetId);
            if (targetIndex !== -1) {
              // Mettre à jour PV de la cible
              state.players[targetIndex].pv = Math.min(
                state.players[targetIndex].pvMax, 
                state.players[targetIndex].pv + attackInfo.healAmount
              );
              
              // Réduire le mana du soigneur
              if (playerIndex !== -1) {
                state.players[playerIndex].mana -= attackInfo.manaCost;
              }
              
              // Log pour le soin
              state.lastAttack = {
                type: "heal",
                name: attackInfo.name,
                healerName: player.name,
                targetName: attackInfo.targetName,
                healAmount: attackInfo.healAmount
              };
              
              // Message spécifique de soin
              if (window.addCombatLogMessage) {
                window.addCombatLogMessage(
                  `${player.name} utilise ${attackInfo.name} sur ${attackInfo.targetName} et restaure ${attackInfo.healAmount} points de vie!`,
                  "success"
                );
              }
            }
          } 
          else if (attackInfo.type === "resurrect") {
            // Résurrection - utiliser l'ID de la cible
            const targetIndex = state.players.findIndex(p => p.id === attackInfo.targetId);
            if (targetIndex !== -1 && state.players[targetIndex].pv === 0) {
              // Ressusciter le joueur
              state.players[targetIndex].pv = attackInfo.healAmount;
              
              // Réduire le mana du lanceur
              if (playerIndex !== -1) {
                state.players[playerIndex].mana -= attackInfo.manaCost;
              }
              
              // Log pour la résurrection
              state.lastAttack = {
                type: "resurrect",
                name: attackInfo.name,
                healerName: player.name,
                targetName: attackInfo.targetName,
                healAmount: attackInfo.healAmount
              };
              
              // Message spécifique de résurrection
              if (window.addCombatLogMessage) {
                window.addCombatLogMessage(
                  `${player.name} utilise ${attackInfo.name} sur ${attackInfo.targetName} et le ressuscite avec ${attackInfo.healAmount} points de vie!`,
                  "warning"
                );
              }
            }
          }
          else {
            // Attaque normale
            state.monster.pv = Math.max(0, state.monster.pv - attackInfo.damage);
            
            // Réduire le mana de l'attaquant
            if (playerIndex !== -1) {
              state.players[playerIndex].mana -= attackInfo.manaCost;
            }
            
            // Log pour l'attaque
            state.lastAttack = {
              type: "playerAttack",
              name: attackInfo.name,
              attackerName: player.name,
              damage: attackInfo.damage
            };
            
            // Message spécifique d'attaque
            if (window.addCombatLogMessage) {
              window.addCombatLogMessage(
                `${player.name} attaque Neclord avec ${attackInfo.name} et inflige ${attackInfo.damage} dégâts!`,
                "primary"
              );
            }
            
            // Contre-attaque du monstre
            const monsterMissesAttack = Math.random() <= 0.3;
            if (!monsterMissesAttack) {
              const randomDamage = Math.floor(Math.random() * 6) + 3; // 3-8 dégâts
              
              // Mettre à jour les PV du joueur
              if (playerIndex !== -1) {
                state.players[playerIndex].pv = Math.max(0, state.players[playerIndex].pv - randomDamage);
              }
              
              // Message de contre-attaque
              if (window.addCombatLogMessage) {
                window.addCombatLogMessage(
                  `Neclord contre-attaque ${player.name} et inflige ${randomDamage} dégâts!`,
                  "danger"
                );
              }
            } else {
              // Message d'échec de contre-attaque
              if (window.addCombatLogMessage) {
                window.addCombatLogMessage(
                  "Neclord rate sa contre-attaque!",
                  "success"
                );
              }
            }
          }
          
          // Marquer ce joueur comme ayant agi
          state.playersWhoActed.push(player.id);
        }
      });
      
      // Vérifier si le monstre est vaincu
      if (state.monster.pv === 0) {
        state.gameStatus = "victory";
      }
    },
  },
});

export const {
  hitMonster,
  hitBack,
  monsterAttack,
  healAlly,
  resurrectAlly,
  autoAttack,
} = fightSlice.actions;

export default fightSlice.reducer;
