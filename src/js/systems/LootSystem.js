import { ITEM_STATS_BY_RARITY, BASE_ITEM_TYPES } from '../data/itemData.js';

export class LootSystem {
  generateItem(type, rarity) {
    const rarityData = ITEM_STATS_BY_RARITY[rarity];
    if (!rarityData) return null;

    const baseTypes = BASE_ITEM_TYPES[type];
    if (!baseTypes) return null;

    const itemBaseName = baseTypes[Math.floor(Math.random() * baseTypes.length)];
    const prefix = rarityData.namePrefixes[
      Math.floor(Math.random() * rarityData.namePrefixes.length)
    ];

    const bonusRange =
      type === 'weapon' ? rarityData.weaponBonus : rarityData.armorBonus;
    const bonus =
      bonusRange[0] + Math.floor(Math.random() * (bonusRange[1] - bonusRange[0] + 1));

    return {
      name: `${prefix} ${itemBaseName}`,
      type,
      rarity,
      bonus,
      attackBonus: 0,
      defenseBonus: 0,
    };
  }

  generateUniqueItem(lootEntry) {
    const item = {
      name: lootEntry.uniqueName,
      type: lootEntry.uniqueItemType,
      rarity: lootEntry.uniqueRarity,
      bonus: lootEntry.uniqueBonus || 0,
      attackBonus: lootEntry.attackBonus || 0,
      defenseBonus: lootEntry.defenseBonus || 0,
      isUnique: true,
    };

    return item;
  }

  rollLoot(enemy) {
    const drops = [];

    if (enemy.lootTable && enemy.lootTable.length > 0) {
      for (const lootEntry of enemy.lootTable) {
        if (Math.random() < lootEntry.chance) {
          if (lootEntry.isUnique) {
            drops.push(this.generateUniqueItem(lootEntry));
          } else if (lootEntry.rarities && lootEntry.rarities.length > 0) {
            const rarity =
              lootEntry.rarities[
                Math.floor(Math.random() * lootEntry.rarities.length)
              ];
            drops.push(this.generateItem(lootEntry.type, rarity));
          }
        }
      }
    }

    const goldRange = enemy.goldDropRange || [0, 0];
    const goldDrop =
      goldRange[0] + Math.floor(Math.random() * (goldRange[1] - goldRange[0] + 1));

    let potionDrop = false;
    if (enemy.potionDropChance && Math.random() < enemy.potionDropChance) {
      potionDrop = true;
    }

    return { items: drops, gold: goldDrop, potion: potionDrop };
  }
}
