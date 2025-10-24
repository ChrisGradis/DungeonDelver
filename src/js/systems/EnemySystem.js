import { ENEMIES } from '../data/enemyData.js';
import { GAME_CONSTANTS } from '../data/constants.js';

export class EnemySystem {
  constructor() {
    this.currentEnemy = null;
    this.firstEncounter = true;
  }

  spawnEnemy(playerLevel) {
    let enemyTemplate;
    let enemyPool = [];
    let isElite = false;
    const G_CONST = GAME_CONSTANTS;

    if (this.firstEncounter) {
      this.firstEncounter = false;
      enemyTemplate = ENEMIES.find((e) => e.name === 'Goblin Grunt');
    } else {
      enemyPool = this.getEnemyPoolForLevel(playerLevel);

      if (enemyPool.length === 0) {
        enemyPool = [ENEMIES.find((e) => e.name === 'Goblin Grunt') || ENEMIES[0]];
      }

      enemyTemplate = enemyPool[Math.floor(Math.random() * enemyPool.length)];

      if (
        playerLevel >= G_CONST.ELITE_MODIFIERS.SPAWN_MIN_PLAYER_LEVEL &&
        !enemyTemplate.isSpecial &&
        !enemyTemplate.isFinalBoss &&
        Math.random() < G_CONST.ELITE_MODIFIERS.SPAWN_CHANCE
      ) {
        isElite = true;
      }
    }

    this.currentEnemy = this.scaleEnemy(enemyTemplate, playerLevel, isElite);
    return this.currentEnemy;
  }

  getEnemyPoolForLevel(playerLevel) {
    const enemies = ENEMIES.filter((e) => !e.isSpecial && !e.isFinalBoss);

    if (playerLevel <= 2) {
      return enemies.filter((e) =>
        ['Slime', 'Bat', 'Goblin Grunt'].includes(e.name)
      );
    } else if (playerLevel <= 4) {
      return enemies.filter((e) =>
        ['Skeleton', 'Goblin Grunt', 'Cave Spider', 'Slime'].includes(e.name)
      );
    } else if (playerLevel <= 7) {
      return enemies.filter((e) =>
        ['Orc Scout', 'Dire Wolf', 'Cave Spider', 'Skeleton'].includes(e.name)
      );
    } else if (playerLevel <= 10) {
      return enemies.filter((e) =>
        ['Stone Golem', 'Ogre Brute', 'Deep Goblin Shaman', 'Orc Scout'].includes(
          e.name
        )
      );
    } else if (playerLevel <= 13) {
      return enemies.filter((e) =>
        ['Minotaur Charger', 'Wraith', 'Deep Goblin Shaman', 'Ogre Brute'].includes(
          e.name
        )
      );
    } else if (playerLevel <= 16) {
      const pool = enemies.filter((e) =>
        ['Dread Knight', 'Nether Sorcerer', 'Wraith'].includes(e.name)
      );
      if (Math.random() < 0.04) {
        const bossPool = ENEMIES.filter((e) =>
          ['Ancient Wyrm', 'Dungeon Guardian'].includes(e.name)
        );
        if (bossPool.length > 0)
          pool.push(bossPool[Math.floor(Math.random() * bossPool.length)]);
      }
      return pool;
    } else if (playerLevel <= 19) {
      const pool = enemies.filter((e) =>
        [
          'Abyssal Behemoth',
          'Aspect of Shadow',
          'Infernal Juggernaut',
          'Archlich Channeler',
          'Void Reaver',
        ].includes(e.name)
      );
      if (Math.random() < 0.05) {
        const bossPool = ENEMIES.filter((e) =>
          ['Ancient Wyrm', 'Dungeon Guardian'].includes(e.name)
        );
        if (bossPool.length > 0)
          pool.push(bossPool[Math.floor(Math.random() * bossPool.length)]);
      }
      return pool;
    } else if (playerLevel <= 23) {
      const pool = enemies.filter((e) =>
        [
          'Celestial Paladin',
          'Void Ascendant',
          'Chronomancer Adept',
          'Corrupted Treant',
          'Infernal Juggernaut',
          'Archlich Channeler',
        ].includes(e.name)
      );
      if (Math.random() < 0.06) {
        const finalEnemy = ENEMIES.find((e) => e.name === 'Reality Sculptor');
        if (finalEnemy) pool.push(finalEnemy);
      }
      return pool;
    } else if (playerLevel <= 27) {
      const pool = enemies.filter((e) =>
        [
          'Reality Sculptor',
          'Celestial Paladin',
          'Void Ascendant',
          'Chronomancer Adept',
          'Corrupted Treant',
        ].includes(e.name)
      );
      if (Math.random() < 0.12) {
        const netherTyrant = ENEMIES.find((e) => e.name === 'The Nether Tyrant');
        if (netherTyrant) pool.push(netherTyrant);
      }
      return pool;
    } else {
      const pool = enemies.filter((e) =>
        [
          'The Nether Tyrant',
          'Reality Sculptor',
          'Celestial Paladin',
          'Void Ascendant',
        ].includes(e.name)
      );
      if (Math.random() < 0.5) {
        const netherTyrant = ENEMIES.find((e) => e.name === 'The Nether Tyrant');
        if (netherTyrant) return [netherTyrant];
      }
      return pool;
    }
  }

  scaleEnemy(template, playerLevel, isElite) {
    const G_CONST = GAME_CONSTANTS;
    const enemyIndex = ENEMIES.findIndex((e) => e.name === template.name);
    const enemyLevelTier = Math.max(
      1,
      Math.floor(enemyIndex / G_CONST.ENEMY_SCALING.LEVEL_TIER_DIVISOR) + 1
    );
    const playerLevelAdvantage = Math.max(0, playerLevel - enemyLevelTier);

    let baseHp = template.baseHp;
    let baseAttack = template.baseAttack;
    let baseDefense = template.baseDefense;
    let xpYield = template.xpYield;
    let goldDropMin = template.goldDropRange ? template.goldDropRange[0] : 0;
    let goldDropMax = template.goldDropRange ? template.goldDropRange[1] : 0;
    let lootTable = template.lootTable
      ? JSON.parse(JSON.stringify(template.lootTable))
      : [];

    if (isElite) {
      baseHp = Math.floor(baseHp * G_CONST.ELITE_MODIFIERS.HP_MULTIPLIER);
      baseAttack = Math.floor(baseAttack * G_CONST.ELITE_MODIFIERS.ATK_MULTIPLIER);
      baseDefense = Math.floor(baseDefense * G_CONST.ELITE_MODIFIERS.DEF_MULTIPLIER);
      xpYield = Math.floor(xpYield * G_CONST.ELITE_MODIFIERS.XP_MULTIPLIER);
      goldDropMin = Math.floor(goldDropMin * G_CONST.ELITE_MODIFIERS.GOLD_MULTIPLIER);
      goldDropMax = Math.floor(goldDropMax * G_CONST.ELITE_MODIFIERS.GOLD_MULTIPLIER);
      lootTable = lootTable.map((loot) => ({
        ...loot,
        chance: Math.min(
          1,
          loot.chance * G_CONST.ELITE_MODIFIERS.LOOT_CHANCE_MULTIPLIER
        ),
      }));
    }

    const scaledEnemy = {
      ...template,
      name: isElite ? `Elite ${template.name}` : template.name,
      isElite,
      baseHp,
      baseAttack,
      baseDefense,
      currentHp: Math.floor(
        baseHp +
          playerLevelAdvantage *
            (baseHp * G_CONST.ENEMY_SCALING.HP_PER_LEVEL_ADVANTAGE_FACTOR) +
          playerLevel * G_CONST.ENEMY_SCALING.HP_FLAT_PER_PLAYER_LEVEL
      ),
      attack: Math.floor(
        baseAttack +
          playerLevelAdvantage *
            (baseAttack * G_CONST.ENEMY_SCALING.ATK_PER_LEVEL_ADVANTAGE_FACTOR) +
          Math.floor(playerLevel * G_CONST.ENEMY_SCALING.ATK_FLAT_PER_PLAYER_LEVEL)
      ),
      defense: Math.floor(
        baseDefense +
          playerLevelAdvantage *
            (baseDefense * G_CONST.ENEMY_SCALING.DEF_PER_LEVEL_ADVANTAGE_FACTOR) +
          Math.floor(playerLevel * G_CONST.ENEMY_SCALING.DEF_FLAT_PER_PLAYER_LEVEL)
      ),
      xpYield,
      goldDropRange: [goldDropMin, goldDropMax],
      lootTable,
      maxHp: Math.floor(
        baseHp +
          playerLevelAdvantage *
            (baseHp * G_CONST.ENEMY_SCALING.HP_PER_LEVEL_ADVANTAGE_FACTOR) +
          playerLevel * G_CONST.ENEMY_SCALING.HP_FLAT_PER_PLAYER_LEVEL
      ),
    };

    scaledEnemy.currentHp = Math.max(baseHp, scaledEnemy.currentHp);
    scaledEnemy.attack = Math.max(baseAttack, scaledEnemy.attack);
    scaledEnemy.defense = Math.max(baseDefense, scaledEnemy.defense);

    return scaledEnemy;
  }

  spawnSpecialEnemy(enemyName) {
    const template = ENEMIES.find((e) => e.name === enemyName);
    if (!template) return null;

    this.currentEnemy = { ...template, currentHp: template.baseHp };
    return this.currentEnemy;
  }
}
