# Gradis' Dungeon Delver

A dungeon crawler game built with vanilla JavaScript and Supabase.

## Features

- **Pet System**: Collect and use pets that provide various bonuses
- **Enhanced Final Boss**: The Nether Tyrant with special abilities
- **Persistent Progress**: Save your game state to Supabase
- **Modular Architecture**: Clean, maintainable code structure
- **30+ Enemies**: From Slimes to the Nether Tyrant
- **10 Rarity Tiers**: Common to Transcendent items
- **15 Pet Companions**: Each with unique bonuses
- **Progressive Difficulty**: Enemies scale with your level
- **Elite Enemies**: Tougher variants with better rewards

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6 Modules)
- **Build Tool**: Vite
- **Database**: Supabase (PostgreSQL)
- **Styling**: CSS Variables with dark/light themes

## Project Structure

```
src/
├── js/
│   ├── data/
│   │   ├── constants.js      # Game configuration
│   │   ├── enemyData.js      # Enemy definitions
│   │   ├── itemData.js       # Item and accessory data
│   │   └── petData.js        # Pet definitions
│   ├── systems/
│   │   ├── PlayerSystem.js   # Player state and progression
│   │   ├── EnemySystem.js    # Enemy spawning and scaling
│   │   ├── LootSystem.js     # Item generation
│   │   └── PetSystem.js      # Pet encounters
│   ├── ui/
│   │   └── UIManager.js      # UI updates and rendering
│   ├── utils/
│   │   ├── formatting.js     # Number formatting
│   │   └── supabase.js       # Supabase client
│   ├── Game.js               # Main game controller
│   └── main.js               # Entry point
├── styles/
│   └── main.css              # All game styles
└── index.html                # Clean HTML structure
```

## Database Schema

### Tables

- **player_saves**: Persistent player progress
- **enemies**: Enemy templates (pre-populated)
- **pets**: Pet definitions (pre-populated)
- **items**: Item templates (future use)

All tables have Row Level Security (RLS) enabled.

## Development

### Prerequisites

- Node.js 18+
- Supabase account and project

### Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Game Mechanics

### Pet System

- Pets are encountered randomly while exploring
- Each pet provides unique stat bonuses
- Only one pet can be active at a time
- Pets persist across sessions
- Rarity tiers: Common, Uncommon, Rare, Epic, Legendary, Mythic

### Final Boss

The Nether Tyrant (Level 28+):
- Special abilities: Dark Ritual, Void Blast, Soul Drain
- Massive health pool and high stats
- Ultimate end-game challenge
- Victory grants significant rewards

### Progression

- Level up to increase stats
- Find or purchase better equipment
- Collect pets for additional bonuses
- Face increasingly difficult enemies
- Defeat the final boss to win

## Completed Features

- [x] Pet system with 15 unique companions
- [x] Enhanced final boss with special abilities
- [x] Modular codebase architecture
- [x] Supabase integration for persistence
- [x] Progress bars for HP/XP
- [x] Number formatting options
- [x] Dark/light theme support
- [x] 30+ enemy types with scaling
- [x] Elite enemy variants

## Future Enhancements

- [ ] Inventory management system
- [ ] Merchant shop improvements
- [ ] Additional pet abilities
- [ ] More boss encounters
- [ ] Achievement system
- [ ] Leaderboards
- [ ] Additional game modes

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

MIT
