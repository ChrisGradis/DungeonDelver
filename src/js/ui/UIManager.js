import { formatNumber } from '../utils/formatting.js';

export class UIManager {
  constructor() {
    this.elements = {};
    this.logMessages = [];
    this.maxLogEntries = 40;
  }

  initializeElements() {
    this.elements = {
      playerLevel: document.getElementById('player-level'),
      playerXp: document.getElementById('player-xp'),
      playerHp: document.getElementById('player-hp'),
      playerBaseAttack: document.getElementById('player-base-attack'),
      playerBaseDefense: document.getElementById('player-base-defense'),
      playerGold: document.getElementById('player-gold'),
      playerTotalAttack: document.getElementById('player-total-attack'),
      playerTotalDefense: document.getElementById('player-total-defense'),
      playerWeaponName: document.getElementById('player-weapon-name'),
      playerWeaponBonus: document.getElementById('player-weapon-bonus'),
      playerWeaponRarity: document.getElementById('player-weapon-rarity'),
      playerArmorName: document.getElementById('player-armor-name'),
      playerArmorBonus: document.getElementById('player-armor-bonus'),
      playerArmorRarity: document.getElementById('player-armor-rarity'),
      playerAccessoryName: document.getElementById('player-accessory-name'),
      playerAccessoryBonus: document.getElementById('player-accessory-bonus'),
      playerAccessoryRarity: document.getElementById('player-accessory-rarity'),
      playerPetName: document.getElementById('player-pet-name'),
      playerPetBonus: document.getElementById('player-pet-bonus'),
      playerPetRarity: document.getElementById('player-pet-rarity'),
      xpBar: document.getElementById('xp-bar'),
      hpBar: document.getElementById('hp-bar'),
      enemyName: document.getElementById('enemy-name'),
      enemyHp: document.getElementById('enemy-hp'),
      enemyHpBar: document.getElementById('enemy-hp-bar'),
      enemyArea: document.getElementById('enemy-area'),
      merchantArea: document.getElementById('merchant-area'),
      log: document.getElementById('log'),
      exploreButton: document.getElementById('explore-button'),
      attackButton: document.getElementById('attack-button'),
      defendButton: document.getElementById('defend-button'),
      potionButton: document.getElementById('potion-button'),
      potionCount: document.getElementById('potion-count-button'),
      gameOverScreen: document.getElementById('game-over-screen'),
      gameOverMessage: document.getElementById('game-over-message'),
      restartButton: document.getElementById('restart-button'),
    };
  }

  updatePlayerStats(player, totalAttack, totalDefense) {
    this.elements.playerLevel.textContent = formatNumber(player.level);
    this.elements.playerXp.textContent = `${formatNumber(player.xp)} / ${formatNumber(player.xpToNextLevel)}`;
    this.elements.playerHp.textContent = `${formatNumber(player.currentHp)} / ${formatNumber(player.maxHp)}`;
    this.elements.playerBaseAttack.textContent = formatNumber(player.baseAttack);
    this.elements.playerBaseDefense.textContent = formatNumber(player.baseDefense);
    this.elements.playerGold.textContent = formatNumber(player.gold);
    this.elements.playerTotalAttack.textContent = formatNumber(totalAttack);
    this.elements.playerTotalDefense.textContent = formatNumber(totalDefense);

    const xpPercent = (player.xp / player.xpToNextLevel) * 100;
    this.elements.xpBar.style.width = `${xpPercent}%`;

    const hpPercent = (player.currentHp / player.maxHp) * 100;
    this.elements.hpBar.style.width = `${hpPercent}%`;
    this.elements.hpBar.classList.remove('low', 'critical');
    if (hpPercent <= 25) {
      this.elements.hpBar.classList.add('critical');
    } else if (hpPercent <= 50) {
      this.elements.hpBar.classList.add('low');
    }

    this.updateEquipment(player);
  }

  updateEquipment(player) {
    this.elements.playerWeaponName.textContent = player.weapon.name;
    this.elements.playerWeaponBonus.textContent = `(+${player.weapon.bonus} ATK)`;
    this.elements.playerWeaponRarity.textContent = `[${player.weapon.rarity}]`;
    this.elements.playerWeaponRarity.className = `rarity-${player.weapon.rarity}`;

    this.elements.playerArmorName.textContent = player.armor.name;
    this.elements.playerArmorBonus.textContent = `(+${player.armor.bonus} DEF)`;
    this.elements.playerArmorRarity.textContent = `[${player.armor.rarity}]`;
    this.elements.playerArmorRarity.className = `rarity-${player.armor.rarity}`;

    this.elements.playerAccessoryName.textContent = player.accessory.name;
    this.elements.playerAccessoryBonus.textContent = player.accessory.description || '';
    this.elements.playerAccessoryRarity.textContent =
      player.accessory.rarity !== 'Common' ? `[${player.accessory.rarity}]` : '';
    this.elements.playerAccessoryRarity.className = `rarity-${player.accessory.rarity}`;

    if (player.activePet) {
      this.elements.playerPetName.textContent = player.activePet.name;
      this.elements.playerPetBonus.textContent = player.activePet.specialAbility || '';
      this.elements.playerPetRarity.textContent = `[${player.activePet.rarity}]`;
      this.elements.playerPetRarity.className = `rarity-${player.activePet.rarity}`;
    } else {
      this.elements.playerPetName.textContent = 'None';
      this.elements.playerPetBonus.textContent = '';
      this.elements.playerPetRarity.textContent = '';
    }

    this.elements.potionCount.textContent = player.potions;
  }

  updateEnemyStats(enemy) {
    if (!enemy) return;

    const displayName = enemy.isElite
      ? `<span class="elite-enemy">${enemy.name}</span>`
      : `<strong>${enemy.name}</strong>`;

    this.elements.enemyName.innerHTML = displayName;
    this.elements.enemyHp.textContent = `${formatNumber(enemy.currentHp)} HP`;

    if (enemy.maxHp) {
      const hpPercent = (enemy.currentHp / enemy.maxHp) * 100;
      this.elements.enemyHpBar.style.width = `${hpPercent}%`;
    }
  }

  addLog(message) {
    this.logMessages.unshift(message);
    if (this.logMessages.length > this.maxLogEntries) {
      this.logMessages = this.logMessages.slice(0, this.maxLogEntries);
    }

    this.elements.log.innerHTML = this.logMessages.map((msg) => `<p>${msg}</p>`).join('');
  }

  toggleCombatUI(inCombat) {
    this.elements.exploreButton.style.display = inCombat ? 'none' : 'block';
    this.elements.attackButton.style.display = inCombat ? 'block' : 'none';
    this.elements.defendButton.style.display = inCombat ? 'block' : 'none';
    this.elements.potionButton.style.display = inCombat ? 'block' : 'none';
    this.elements.enemyArea.style.display = inCombat ? 'block' : 'none';

    if (!inCombat) {
      this.elements.merchantArea.style.display = 'none';
    }
  }

  showGameOver(playerLevel) {
    this.elements.gameOverMessage.textContent = `Game Over! You reached Level ${formatNumber(playerLevel)}.`;
    this.elements.gameOverScreen.style.display = 'block';
    this.toggleCombatUI(false);
    this.elements.exploreButton.style.display = 'none';
  }

  hideGameOver() {
    this.elements.gameOverScreen.style.display = 'none';
  }
}
