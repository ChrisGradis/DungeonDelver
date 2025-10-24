# Migration Guide

## What Changed?

Your dungeon crawler has been completely restructured from a monolithic HTML file into a modern, modular application.

## Key Improvements

### 1. **Modular Architecture**
- **Before**: Everything in one 2000+ line HTML file
- **After**: Organized into logical modules by responsibility

### 2. **Database Integration**
- **Before**: No persistence
- **After**: Supabase database stores player progress, can be extended for leaderboards

### 3. **Pet System** (NEW!)
- 15 unique pets across 6 rarity tiers
- Pets provide stat bonuses (attack, defense, HP, crit, gold find, XP gain, etc.)
- Random encounters while exploring
- Persistent pet collection

### 4. **Enhanced Final Boss**
- The Nether Tyrant now has special abilities:
  - Dark Ritual: Heals 10% of max HP
  - Void Blast: Ignores 50% of player defense
  - Soul Drain: Steals 15% of damage as HP
- Increased health pool (3500 → 4500 base HP)
- Better loot and rewards

### 5. **Build System**
- **Before**: Live-server
- **After**: Vite for fast development and optimized production builds

## File Structure

```
Old Structure:
├── src/
│   ├── index.html (2000+ lines)
│   └── test.html (3000+ lines)

New Structure:
├── src/
│   ├── js/
│   │   ├── data/          # Game data (enemies, items, pets, constants)
│   │   ├── systems/       # Game logic (player, enemy, loot, pets)
│   │   ├── ui/            # UI management
│   │   ├── utils/         # Utilities (formatting, Supabase)
│   │   ├── Game.js        # Main controller
│   │   └── main.js        # Entry point
│   └── styles/
│       └── main.css       # All styles
├── index.html             # Clean HTML
└── vite.config.js         # Build config
```

## How to Use

### Development
```bash
npm run dev
```
Opens at http://localhost:3000

### Production Build
```bash
npm run build
```
Creates optimized files in `dist/`

### Preview Production Build
```bash
npm run preview
```

## Adding New Content

### Adding a New Enemy
Edit `src/js/data/enemyData.js`:
```javascript
{
  name: 'New Enemy',
  baseHp: 100,
  baseAttack: 20,
  baseDefense: 5,
  xpYield: 50,
  goldDropRange: [10, 20],
  lootTable: [...],
  potionDropChance: 0.15,
}
```

### Adding a New Pet
Edit `src/js/data/petData.js`:
```javascript
{
  name: 'New Pet',
  rarity: 'Rare',
  description: 'Description',
  bonuses: { flatAttack: 5, critChance: 0.03 },
  specialAbility: 'Ability description',
  unlockLevel: 5,
  baseFindChance: 0.05,
}
```

### Adjusting Game Balance
Edit `src/js/data/constants.js`:
```javascript
GAME_CONSTANTS = {
  PET_SYSTEM: {
    BASE_ENCOUNTER_CHANCE: 0.05,  // Adjust pet encounter rate
  },
  ELITE_MODIFIERS: {
    SPAWN_CHANCE: 0.15,            // Adjust elite spawn rate
  },
  // ... many other configurable values
}
```

## Database

The game uses Supabase for:
- Player save data (level, stats, equipment, pets)
- Enemy templates (optional, currently client-side)
- Pet definitions (optional, currently client-side)

### Player Data Storage
- Auto-saves after significant events
- Unique per browser (localStorage user ID)
- Can be extended to auth-based saves

## Benefits of New Structure

1. **Easier to Maintain**: Each file has a single responsibility
2. **Easier to Extend**: Add new systems without touching existing code
3. **Better Performance**: Vite optimizes the build
4. **Type Safety Ready**: Easy to migrate to TypeScript later
5. **Testable**: Modular code is easier to test
6. **Cloud Saves**: Supabase enables cross-device play
7. **Scalable**: Can add multiplayer, achievements, etc.

## Next Steps

You can now easily:
- Add more pets and enemies
- Create new game modes
- Add inventory management
- Implement achievements
- Add more bosses
- Create a shop system
- Add multiplayer features

The modular structure makes all of these much simpler to implement!
