import { PETS } from '../data/petData.js';
import { GAME_CONSTANTS } from '../data/constants.js';

export class PetSystem {
  tryEncounterPet(playerLevel) {
    const baseChance = GAME_CONSTANTS.PET_SYSTEM.BASE_ENCOUNTER_CHANCE;
    const levelMultiplier = GAME_CONSTANTS.PET_SYSTEM.LEVEL_ENCOUNTER_MULTIPLIER;
    const encounterChance = baseChance + playerLevel * levelMultiplier;

    if (Math.random() > encounterChance) {
      return null;
    }

    const availablePets = PETS.filter((pet) => pet.unlockLevel <= playerLevel);
    if (availablePets.length === 0) return null;

    const totalWeight = availablePets.reduce((sum, pet) => sum + pet.baseFindChance, 0);
    let random = Math.random() * totalWeight;

    for (const pet of availablePets) {
      random -= pet.baseFindChance;
      if (random <= 0) {
        return { ...pet };
      }
    }

    return null;
  }

  getPetsByRarity(rarity) {
    return PETS.filter((pet) => pet.rarity === rarity);
  }

  getAllPets() {
    return [...PETS];
  }
}
