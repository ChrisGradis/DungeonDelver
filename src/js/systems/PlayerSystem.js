import { GAME_CONSTANTS } from '../data/constants.js';
import { supabase } from '../utils/supabase.js';

export class PlayerSystem {
  constructor() {
    this.player = null;
    this.userId = this.generateUserId();
  }

  generateUserId() {
    let userId = localStorage.getItem('dungeonDelverUserId');
    if (!userId) {
      userId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('dungeonDelverUserId', userId);
    }
    return userId;
  }

  async loadPlayer() {
    const { data, error } = await supabase
      .from('player_saves')
      .select('*')
      .eq('user_id', this.userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading player:', error);
    }

    if (data) {
      this.player = {
        level: data.level,
        xp: data.xp,
        xpToNextLevel: data.xp_to_next_level,
        currentHp: data.current_hp,
        maxHp: data.max_hp,
        baseAttack: data.base_attack,
        baseDefense: data.base_defense,
        gold: data.gold,
        potions: data.potions,
        maxPotions: data.max_potions,
        weapon: data.weapon,
        armor: data.armor,
        accessory: data.accessory,
        activePet: data.active_pet,
        pets: data.pets || [],
        isDefending: false,
      };
    } else {
      this.player = this.createNewPlayer();
    }

    return this.player;
  }

  createNewPlayer() {
    const stats = GAME_CONSTANTS.INITIAL_PLAYER_STATS;
    return {
      level: stats.LEVEL,
      xp: stats.XP,
      xpToNextLevel: stats.XP_TO_NEXT_LEVEL,
      currentHp: stats.CURRENT_HP,
      maxHp: stats.MAX_HP,
      baseAttack: stats.BASE_ATTACK,
      baseDefense: stats.BASE_DEFENSE,
      potions: stats.POTIONS,
      maxPotions: stats.MAX_POTIONS,
      gold: stats.GOLD,
      weapon: { ...stats.DEFAULT_WEAPON },
      armor: { ...stats.DEFAULT_ARMOR },
      accessory: { ...stats.DEFAULT_ACCESSORY },
      activePet: null,
      pets: [],
      isDefending: false,
    };
  }

  async savePlayer() {
    if (!this.player) return;

    const saveData = {
      user_id: this.userId,
      level: this.player.level,
      xp: this.player.xp,
      xp_to_next_level: this.player.xpToNextLevel,
      current_hp: this.player.currentHp,
      max_hp: this.player.maxHp,
      base_attack: this.player.baseAttack,
      base_defense: this.player.baseDefense,
      gold: this.player.gold,
      potions: this.player.potions,
      max_potions: this.player.maxPotions,
      weapon: this.player.weapon,
      armor: this.player.armor,
      accessory: this.player.accessory,
      active_pet: this.player.activePet,
      pets: this.player.pets,
      last_saved: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('player_saves')
      .upsert(saveData, { onConflict: 'user_id' });

    if (error) {
      console.error('Error saving player:', error);
    }
  }

  getTotalAttack() {
    let total =
      this.player.baseAttack +
      this.player.weapon.bonus +
      (this.player.weapon.attackBonus || 0);

    if (this.player.accessory?.bonuses?.flatAttack) {
      total += this.player.accessory.bonuses.flatAttack;
    }

    if (this.player.activePet?.bonuses?.flatAttack) {
      total += this.player.activePet.bonuses.flatAttack;
    }

    return total;
  }

  getTotalDefense() {
    let total =
      this.player.baseDefense +
      this.player.armor.bonus +
      (this.player.armor.defenseBonus || 0);

    if (this.player.accessory?.bonuses?.flatDefense) {
      total += this.player.accessory.bonuses.flatDefense;
    }

    if (this.player.activePet?.bonuses?.flatDefense) {
      total += this.player.activePet.bonuses.flatDefense;
    }

    return total;
  }

  addGold(amount) {
    let goldMultiplier = 1;

    if (this.player.accessory?.bonuses?.goldFind) {
      goldMultiplier += this.player.accessory.bonuses.goldFind;
    }

    if (this.player.activePet?.bonuses?.goldFind) {
      goldMultiplier += this.player.activePet.bonuses.goldFind;
    }

    this.player.gold += Math.floor(amount * goldMultiplier);
  }

  addXp(amount) {
    let xpMultiplier = 1;

    if (this.player.accessory?.bonuses?.xpGain) {
      xpMultiplier += this.player.accessory.bonuses.xpGain;
    }

    if (this.player.activePet?.bonuses?.xpGain) {
      xpMultiplier += this.player.activePet.bonuses.xpGain;
    }

    this.player.xp += Math.floor(amount * xpMultiplier);
  }

  levelUp() {
    this.player.level++;

    const hpGain = GAME_CONSTANTS.LEVEL_UP_HP_GAIN;
    const hpIncrease = Math.floor(
      this.player.maxHp * (hpGain.BASE_PERCENT + this.player.level * hpGain.LEVEL_MULTIPLIER) +
        hpGain.FLAT_BASE
    );
    this.player.maxHp += hpIncrease;
    this.player.currentHp = this.player.maxHp;

    const atkGain = GAME_CONSTANTS.LEVEL_UP_ATTACK_GAIN;
    const atkIncrease = Math.floor(
      this.player.baseAttack *
        (atkGain.BASE_PERCENT + this.player.level * atkGain.LEVEL_MULTIPLIER) +
        (this.player.level % 2 === 0 ? atkGain.EVEN_LEVEL_BONUS : atkGain.ODD_LEVEL_BONUS) +
        (this.player.level % 4 === 0 ? atkGain.PER_4_LEVELS_BONUS : 0)
    );
    this.player.baseAttack += atkIncrease;

    const defGain = GAME_CONSTANTS.LEVEL_UP_DEFENSE_GAIN;
    const defIncrease = Math.floor(
      this.player.baseDefense *
        (defGain.BASE_PERCENT + this.player.level * defGain.LEVEL_MULTIPLIER) +
        (this.player.level % 3 === 0
          ? defGain.PER_3_LEVELS_BONUS
          : defGain.OTHER_LEVELS_BONUS) +
        (this.player.level % 5 === 0 ? defGain.PER_5_LEVELS_BONUS : 0)
    );
    this.player.baseDefense += defIncrease;

    const xpMultipliers = GAME_CONSTANTS.LEVEL_UP_XP_MULTIPLIERS;
    const multiplierData = xpMultipliers.find((m) => this.player.level >= m.minLevel);
    const multiplier = multiplierData ? multiplierData.multiplier : 1.65;
    this.player.xpToNextLevel = Math.floor(this.player.xpToNextLevel * multiplier);

    return { hpIncrease, atkIncrease, defIncrease };
  }

  healPotion() {
    const healPercent =
      GAME_CONSTANTS.POTION_HEAL_BASE_PERCENT +
      this.player.level * GAME_CONSTANTS.POTION_HEAL_LEVEL_MULTIPLIER;
    let healAmount = Math.floor(this.player.maxHp * healPercent);

    let potionEffectiveness = 1;
    if (this.player.accessory?.bonuses?.potionEffectiveness) {
      potionEffectiveness += this.player.accessory.bonuses.potionEffectiveness;
    }
    if (this.player.activePet?.bonuses?.potionEffectiveness) {
      potionEffectiveness += this.player.activePet.bonuses.potionEffectiveness;
    }

    healAmount = Math.floor(healAmount * potionEffectiveness);

    this.player.currentHp = Math.min(this.player.maxHp, this.player.currentHp + healAmount);
    this.player.potions--;

    return healAmount;
  }

  addPet(pet) {
    const existingPet = this.player.pets.find((p) => p.name === pet.name);
    if (!existingPet) {
      this.player.pets.push(pet);
    }
  }

  setActivePet(petName) {
    const pet = this.player.pets.find((p) => p.name === petName);
    if (pet) {
      this.player.activePet = pet;
    }
  }

  equipItem(item) {
    if (item.type === 'weapon') {
      this.player.weapon = item;
    } else if (item.type === 'armor') {
      this.player.armor = item;
    } else if (item.type === 'accessory') {
      this.player.accessory = item;
    }
  }
}
