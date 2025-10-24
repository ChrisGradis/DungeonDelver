import { PlayerSystem } from './systems/PlayerSystem.js';
import { EnemySystem } from './systems/EnemySystem.js';
import { LootSystem } from './systems/LootSystem.js';
import { PetSystem } from './systems/PetSystem.js';
import { UIManager } from './ui/UIManager.js';
import { GAME_CONSTANTS } from './data/constants.js';
import { ACCESSORIES } from './data/itemData.js';
import { formatNumber, setNumberFormat } from './utils/formatting.js';
import { supabase } from './utils/supabase.js';

export class Game {
  constructor() {
    this.playerSystem = new PlayerSystem();
    this.enemySystem = new EnemySystem();
    this.lootSystem = new LootSystem();
    this.petSystem = new PetSystem();
    this.ui = new UIManager();
    this.inCombat = false;
    this.inMerchant = false;
  }

  async initialize() {
    this.ui.initializeElements();
    await this.playerSystem.loadPlayer();
    this.setupEventListeners();
    this.ui.updatePlayerStats(
      this.playerSystem.player,
      this.playerSystem.getTotalAttack(),
      this.playerSystem.getTotalDefense()
    );
    this.loadSettings();
    this.ui.addLog('Welcome to the Dungeon! Click "Explore" to begin.');
  }

  setupEventListeners() {
    this.ui.elements.exploreButton.addEventListener('click', () => this.explore());
    this.ui.elements.attackButton.addEventListener('click', () => this.attack());
    this.ui.elements.defendButton.addEventListener('click', () => this.defend());
    this.ui.elements.potionButton.addEventListener('click', () => this.usePotion());
    this.ui.elements.restartButton.addEventListener('click', () => this.restart());

    document.addEventListener('keydown', (e) => this.handleKeyPress(e));

    const formatRadios = document.querySelectorAll('input[name="number-format"]');
    formatRadios.forEach((radio) => {
      radio.addEventListener('change', (e) => {
        if (e.target.checked) {
          setNumberFormat(e.target.value);
          localStorage.setItem('numberFormat', e.target.value);
          this.ui.updatePlayerStats(
            this.playerSystem.player,
            this.playerSystem.getTotalAttack(),
            this.playerSystem.getTotalDefense()
          );
        }
      });
    });

    const themeRadios = document.querySelectorAll('input[name="theme"]');
    themeRadios.forEach((radio) => {
      radio.addEventListener('change', (e) => {
        if (e.target.checked) {
          if (e.target.value === 'light') {
            document.body.classList.add('light-theme');
          } else {
            document.body.classList.remove('light-theme');
          }
          localStorage.setItem('theme', e.target.value);
        }
      });
    });
  }

  loadSettings() {
    const savedFormat = localStorage.getItem('numberFormat') || 'standard';
    setNumberFormat(savedFormat);
    const formatRadio = document.querySelector(`input[name="number-format"][value="${savedFormat}"]`);
    if (formatRadio) formatRadio.checked = true;

    const savedTheme = localStorage.getItem('theme') || 'normal';
    if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
    }
    const themeRadio = document.querySelector(`input[name="theme"][value="${savedTheme}"]`);
    if (themeRadio) themeRadio.checked = true;
  }

  handleKeyPress(e) {
    if (e.key === 'Enter' && !this.inCombat && !this.inMerchant) {
      this.explore();
    } else if (e.key === ' ' && this.inCombat) {
      e.preventDefault();
      this.attack();
    } else if (e.key.toLowerCase() === 'd' && this.inCombat) {
      this.defend();
    } else if (e.key.toLowerCase() === 'p' && this.inCombat) {
      this.usePotion();
    }
  }

  explore() {
    const roll = Math.random();
    const thresholds = GAME_CONSTANTS.EXPLORE_EVENT_THRESHOLDS;

    if (roll < thresholds.LOST_COLLECTOR) {
      this.encounterLostCollector();
    } else if (roll < thresholds.POTION_CRATE) {
      this.findPotionCrate();
    } else if (roll < thresholds.MERCHANT) {
      this.encounterMerchant();
    } else if (roll < thresholds.STRAY_POTION) {
      this.findStrayPotion();
    } else if (roll < thresholds.BLACKSMITH) {
      this.encounterBlacksmith();
    } else if (roll < thresholds.REST_HOUSE) {
      this.restHouse();
    } else if (roll < thresholds.PET_ENCOUNTER) {
      this.tryPetEncounter();
    } else {
      this.encounterEnemy();
    }
  }

  encounterEnemy() {
    const enemy = this.enemySystem.spawnEnemy(this.playerSystem.player.level);
    const displayName = enemy.isElite
      ? `<span class="elite-enemy">${enemy.name}</span>`
      : `<strong>${enemy.name}</strong>`;

    this.ui.addLog(
      `A wild ${displayName} (Lvl ~${formatNumber(this.playerSystem.player.level)}) appears!${enemy.isElite ? ' It radiates a menacing aura!' : ''}`
    );

    this.inCombat = true;
    this.ui.toggleCombatUI(true);
    this.ui.updateEnemyStats(enemy);
  }

  tryPetEncounter() {
    const pet = this.petSystem.tryEncounterPet(this.playerSystem.player.level);
    if (pet) {
      const existingPet = this.playerSystem.player.pets.find(
        (p) => p.name === pet.name
      );
      if (!existingPet) {
        this.playerSystem.addPet(pet);
        this.ui.addLog(
          `You found a <span class="rarity-${pet.rarity}">${pet.name}</span>! ${pet.description}`
        );
        this.ui.addLog(`${pet.specialAbility}. The pet joins your collection!`);

        if (!this.playerSystem.player.activePet) {
          this.playerSystem.setActivePet(pet.name);
          this.ui.addLog(`${pet.name} is now your active companion!`);
        }

        this.playerSystem.savePlayer();
        this.ui.updatePlayerStats(
          this.playerSystem.player,
          this.playerSystem.getTotalAttack(),
          this.playerSystem.getTotalDefense()
        );
      } else {
        this.ui.addLog(
          `You encountered a ${pet.name}, but you already have one in your collection.`
        );
      }
    } else {
      this.encounterEnemy();
    }
  }

  attack() {
    if (!this.enemySystem.currentEnemy || !this.inCombat) return;

    this.playerSystem.player.isDefending = false;
    const enemy = this.enemySystem.currentEnemy;

    const playerAttack = this.playerSystem.getTotalAttack();
    let damage = Math.max(1, playerAttack - enemy.defense);

    let critChance =
      GAME_CONSTANTS.PLAYER_BASE_CRIT_CHANCE +
      this.playerSystem.player.level *
        GAME_CONSTANTS.PLAYER_CRIT_CHANCE_LEVEL_MULTIPLIER +
      (this.playerSystem.player.accessory?.bonuses?.critChance || 0) +
      (this.playerSystem.player.activePet?.bonuses?.critChance || 0);

    const displayName = enemy.isElite
      ? `<span class="elite-enemy">${enemy.name}</span>`
      : `<strong>${enemy.name}</strong>`;

    if (Math.random() < critChance) {
      let critMultiplier =
        GAME_CONSTANTS.PLAYER_BASE_CRIT_DAMAGE_MULTIPLIER +
        this.playerSystem.player.level *
          GAME_CONSTANTS.PLAYER_CRIT_DAMAGE_LEVEL_MULTIPLIER +
        (this.playerSystem.player.accessory?.bonuses?.critDamage || 0) +
        (this.playerSystem.player.activePet?.bonuses?.critDamage || 0);

      damage = Math.floor(damage * critMultiplier);
      this.ui.addLog(
        `<strong>CRITICAL HIT!</strong> You attack ${displayName} for <strong style="color:#ff8c00;">${formatNumber(damage)}</strong> damage!`
      );
    } else {
      this.ui.addLog(
        `You attack ${displayName} for <strong>${formatNumber(damage)}</strong> damage.`
      );
    }

    enemy.currentHp = Math.max(0, enemy.currentHp - damage);
    this.ui.updateEnemyStats(enemy);

    if (enemy.currentHp <= 0) {
      this.handleEnemyDefeat();
    } else {
      this.enemyTurn();
    }
  }

  defend() {
    if (!this.enemySystem.currentEnemy || !this.inCombat) return;

    this.playerSystem.player.isDefending = true;
    this.ui.addLog('You brace yourself for the next attack!');
    this.enemyTurn();
  }

  usePotion() {
    if (!this.inCombat || this.playerSystem.player.potions <= 0) return;

    const healAmount = this.playerSystem.healPotion();
    this.ui.addLog(
      `You drink a potion and restore <strong style="color:#90ee90;">${formatNumber(healAmount)}</strong> HP.`
    );

    this.ui.updatePlayerStats(
      this.playerSystem.player,
      this.playerSystem.getTotalAttack(),
      this.playerSystem.getTotalDefense()
    );

    this.enemyTurn();
  }

  enemyTurn() {
    const enemy = this.enemySystem.currentEnemy;
    if (!enemy || enemy.currentHp <= 0) return;

    if (enemy.timeWarpHealChance && Math.random() < enemy.timeWarpHealChance) {
      const healAmount = Math.floor(enemy.maxHp * 0.15);
      enemy.currentHp = Math.min(enemy.maxHp, enemy.currentHp + healAmount);
      this.ui.addLog(
        `<span class="elite-enemy">${enemy.name}</span> manipulates time and heals for ${formatNumber(healAmount)} HP!`
      );
      this.ui.updateEnemyStats(enemy);
      return;
    }

    let enemyDamage = enemy.attack;

    if (enemy.ignoresDefense) {
      this.ui.addLog(
        `<span class="elite-enemy">${enemy.name}</span> strikes with pure force, ignoring your defense!`
      );
    } else {
      const playerDefense = this.playerSystem.player.isDefending
        ? this.playerSystem.getTotalDefense() * 2
        : this.playerSystem.getTotalDefense();
      enemyDamage = Math.max(1, enemyDamage - playerDefense);

      if (this.playerSystem.player.isDefending) {
        this.ui.addLog('Your defense is doubled while defending!');
      }
    }

    let enemyCritChance =
      GAME_CONSTANTS.ENEMY_BASE_CRIT_CHANCE +
      this.playerSystem.player.level *
        GAME_CONSTANTS.ENEMY_CRIT_CHANCE_LEVEL_MULTIPLIER;

    const displayName = enemy.isElite
      ? `<span class="elite-enemy">${enemy.name}</span>`
      : `<strong>${enemy.name}</strong>`;

    if (Math.random() < enemyCritChance) {
      let enemyCritMultiplier =
        GAME_CONSTANTS.ENEMY_BASE_CRIT_DAMAGE_MULTIPLIER +
        this.playerSystem.player.level *
          GAME_CONSTANTS.ENEMY_CRIT_DAMAGE_LEVEL_MULTIPLIER;
      enemyDamage = Math.floor(enemyDamage * enemyCritMultiplier);
      this.ui.addLog(
        `${displayName} lands a <strong>CRITICAL HIT</strong> for <strong style="color:#ff0000;">${formatNumber(enemyDamage)}</strong> damage!`
      );
    } else {
      this.ui.addLog(
        `${displayName} attacks for <strong>${formatNumber(enemyDamage)}</strong> damage.`
      );
    }

    if (enemy.lifeLeechMultiplier) {
      const leech = Math.floor(enemyDamage * enemy.lifeLeechMultiplier);
      enemy.currentHp = Math.min(enemy.maxHp, enemy.currentHp + leech);
      this.ui.addLog(
        `${displayName} leeches ${formatNumber(leech)} HP from you!`
      );
      this.ui.updateEnemyStats(enemy);
    }

    this.playerSystem.player.currentHp = Math.max(
      0,
      this.playerSystem.player.currentHp - enemyDamage
    );
    this.playerSystem.player.isDefending = false;

    this.ui.updatePlayerStats(
      this.playerSystem.player,
      this.playerSystem.getTotalAttack(),
      this.playerSystem.getTotalDefense()
    );

    if (this.playerSystem.player.currentHp <= 0) {
      this.handlePlayerDefeat();
    }
  }

  handleEnemyDefeat() {
    const enemy = this.enemySystem.currentEnemy;
    const displayName = enemy.isElite
      ? `<span class="elite-enemy">${enemy.name}</span>`
      : `<strong>${enemy.name}</strong>`;

    this.ui.addLog(`${displayName} has been defeated!`);

    this.playerSystem.addXp(enemy.xpYield);
    this.ui.addLog(
      `You gained ${formatNumber(enemy.xpYield)} XP.`
    );

    const loot = this.lootSystem.rollLoot(enemy);

    if (loot.gold > 0) {
      this.playerSystem.addGold(loot.gold);
      this.ui.addLog(`You found ${formatNumber(loot.gold)} gold.`);
    }

    if (loot.potion) {
      this.playerSystem.player.potions = Math.min(
        this.playerSystem.player.maxPotions,
        this.playerSystem.player.potions + 1
      );
      this.ui.addLog('A potion dropped!');
    }

    loot.items.forEach((item) => {
      this.handleItemDrop(item);
    });

    if (this.playerSystem.player.xp >= this.playerSystem.player.xpToNextLevel) {
      this.handleLevelUp();
    }

    if (enemy.isFinalBoss) {
      this.ui.addLog(
        '<strong style="color:#ffd700;">VICTORY! You have defeated the Nether Tyrant and conquered the dungeon!</strong>'
      );
    }

    this.inCombat = false;
    this.ui.toggleCombatUI(false);
    this.playerSystem.savePlayer();

    this.ui.updatePlayerStats(
      this.playerSystem.player,
      this.playerSystem.getTotalAttack(),
      this.playerSystem.getTotalDefense()
    );
  }

  handleItemDrop(item) {
    const currentItem =
      item.type === 'weapon'
        ? this.playerSystem.player.weapon
        : this.playerSystem.player.armor;

    this.ui.addLog(
      `<span class="rarity-${item.rarity}">${item.name}</span> dropped! (+${item.bonus} ${item.type === 'weapon' ? 'ATK' : 'DEF'})`
    );

    if (item.bonus > currentItem.bonus) {
      this.playerSystem.equipItem(item);
      this.ui.addLog(`Equipped ${item.name}!`);
    }
  }

  handleLevelUp() {
    const gains = this.playerSystem.levelUp();
    this.ui.addLog(
      `<strong style="color:#00ff00;">LEVEL UP!</strong> You are now level ${formatNumber(this.playerSystem.player.level)}!`
    );
    this.ui.addLog(
      `HP +${formatNumber(gains.hpIncrease)}, ATK +${formatNumber(gains.atkIncrease)}, DEF +${formatNumber(gains.defIncrease)}`
    );
  }

  handlePlayerDefeat() {
    this.ui.addLog('<strong style="color: #ff0000;">You have been defeated!</strong>');
    this.inCombat = false;
    this.ui.toggleCombatUI(false);
    this.ui.showGameOver(this.playerSystem.player.level);
  }

  async restart() {
    await supabase.from('player_saves').delete().eq('user_id', this.playerSystem.userId);
    localStorage.removeItem('dungeonDelverUserId');
    location.reload();
  }

  encounterLostCollector() {
    this.ui.addLog('<strong style="color:#61dafb;">A Lost Collector appears!</strong>');
    this.ui.addLog(
      'The mysterious figure hands you items and vanishes before you can react...'
    );

    const xpReward = Math.floor(
      this.playerSystem.player.xpToNextLevel *
        (GAME_CONSTANTS.LOST_COLLECTOR_XP_REWARD.BASE_PERCENT_OF_NEXT_LEVEL +
          this.playerSystem.player.level *
            GAME_CONSTANTS.LOST_COLLECTOR_XP_REWARD.PER_LEVEL_PERCENT)
    );

    this.playerSystem.addXp(xpReward);
    this.ui.addLog(`You gained ${formatNumber(xpReward)} XP!`);

    const gearBonus =
      GAME_CONSTANTS.LOST_COLLECTOR_GEAR_BONUS_BASE +
      Math.floor(
        this.playerSystem.player.level /
          4 *
          GAME_CONSTANTS.LOST_COLLECTOR_GEAR_BONUS_PER_4_LEVELS
      );

    this.playerSystem.player.weapon.bonus += gearBonus;
    this.playerSystem.player.armor.bonus += gearBonus;
    this.ui.addLog(`Your weapon and armor gained +${formatNumber(gearBonus)} bonus!`);

    const gold = 500 + this.playerSystem.player.level * 50;
    this.playerSystem.addGold(gold);
    this.ui.addLog(`You received ${formatNumber(gold)} gold!`);

    if (this.playerSystem.player.xp >= this.playerSystem.player.xpToNextLevel) {
      this.handleLevelUp();
    }

    this.playerSystem.savePlayer();
    this.ui.updatePlayerStats(
      this.playerSystem.player,
      this.playerSystem.getTotalAttack(),
      this.playerSystem.getTotalDefense()
    );
  }

  findPotionCrate() {
    const amount =
      GAME_CONSTANTS.POTION_CRATE_MIN_FOUND +
      Math.floor(
        Math.random() *
          (GAME_CONSTANTS.POTION_CRATE_MAX_FOUND_EXCLUSIVE -
            GAME_CONSTANTS.POTION_CRATE_MIN_FOUND)
      );

    this.playerSystem.player.potions = Math.min(
      this.playerSystem.player.maxPotions,
      this.playerSystem.player.potions + amount
    );

    this.ui.addLog(`You found a crate with ${amount} potions inside!`);
    this.playerSystem.savePlayer();
    this.ui.updatePlayerStats(
      this.playerSystem.player,
      this.playerSystem.getTotalAttack(),
      this.playerSystem.getTotalDefense()
    );
  }

  findStrayPotion() {
    if (this.playerSystem.player.potions < this.playerSystem.player.maxPotions) {
      this.playerSystem.player.potions++;
      this.ui.addLog('You found a stray potion on the ground!');
      this.playerSystem.savePlayer();
      this.ui.updatePlayerStats(
        this.playerSystem.player,
        this.playerSystem.getTotalAttack(),
        this.playerSystem.getTotalDefense()
      );
    } else {
      this.ui.addLog(
        'You found a stray potion, but your inventory is full.'
      );
    }
  }

  encounterMerchant() {
    this.inMerchant = true;
    this.ui.addLog('<strong style="color:#61dafb;">A Wandering Merchant appears!</strong>');
    this.ui.addLog('"Care to browse my wares, traveler?"');
  }

  encounterBlacksmith() {
    this.ui.addLog('<strong style="color:#ffa500;">You stumble upon a Blacksmith!</strong>');

    const weaponUpgrade =
      Math.random() < GAME_CONSTANTS.BLACKSMITH_UPGRADE_RARE_ROLL_THRESHOLD
        ? GAME_CONSTANTS.BLACKSMITH_UPGRADE_VALUES.RARE
        : GAME_CONSTANTS.BLACKSMITH_UPGRADE_VALUES.COMMON;
    const weaponBonus =
      weaponUpgrade[0] +
      Math.floor(Math.random() * (weaponUpgrade[1] - weaponUpgrade[0] + 1));

    const armorUpgrade =
      Math.random() < GAME_CONSTANTS.BLACKSMITH_UPGRADE_COMMON_ROLL_THRESHOLD
        ? GAME_CONSTANTS.BLACKSMITH_UPGRADE_VALUES.COMMON
        : GAME_CONSTANTS.BLACKSMITH_UPGRADE_VALUES.RARE;
    const armorBonus =
      armorUpgrade[0] +
      Math.floor(Math.random() * (armorUpgrade[1] - armorUpgrade[0] + 1));

    this.playerSystem.player.weapon.bonus += weaponBonus;
    this.playerSystem.player.armor.bonus += armorBonus;

    this.ui.addLog(
      `The blacksmith upgrades your weapon (+${formatNumber(weaponBonus)} ATK) and armor (+${formatNumber(armorBonus)} DEF)!`
    );

    this.playerSystem.savePlayer();
    this.ui.updatePlayerStats(
      this.playerSystem.player,
      this.playerSystem.getTotalAttack(),
      this.playerSystem.getTotalDefense()
    );
  }

  restHouse() {
    const healAmount = Math.floor(this.playerSystem.player.maxHp * 0.5);
    this.playerSystem.player.currentHp = Math.min(
      this.playerSystem.player.maxHp,
      this.playerSystem.player.currentHp + healAmount
    );

    this.ui.addLog('<strong style="color:#90ee90;">You found a Rest House!</strong>');
    this.ui.addLog(`You rest and recover ${formatNumber(healAmount)} HP.`);

    this.playerSystem.savePlayer();
    this.ui.updatePlayerStats(
      this.playerSystem.player,
      this.playerSystem.getTotalAttack(),
      this.playerSystem.getTotalDefense()
    );
  }
}
