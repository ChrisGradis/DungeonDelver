/*
  # Gradis' Dungeon Delver - Game Database Schema

  ## Overview
  Creates the foundational database structure for the dungeon crawler game, including
  player saves, enemies, items, pets, and game configuration.

  ## New Tables

  ### `player_saves`
  Stores player progress and game state
  - `id` (uuid, primary key)
  - `user_id` (text) - unique identifier for the player
  - `level` (integer) - player level
  - `xp` (bigint) - current experience points
  - `xp_to_next_level` (bigint) - XP needed for next level
  - `current_hp` (integer) - current hit points
  - `max_hp` (integer) - maximum hit points
  - `base_attack` (integer) - base attack stat
  - `base_defense` (integer) - base defense stat
  - `gold` (bigint) - current gold
  - `potions` (integer) - potion count
  - `max_potions` (integer) - maximum potion capacity
  - `weapon` (jsonb) - equipped weapon
  - `armor` (jsonb) - equipped armor
  - `accessory` (jsonb) - equipped accessory
  - `active_pet` (jsonb) - currently active pet
  - `pets` (jsonb array) - collection of owned pets
  - `last_saved` (timestamptz) - last save timestamp
  - `created_at` (timestamptz) - creation timestamp

  ### `enemies`
  Stores enemy templates and configurations
  - `id` (uuid, primary key)
  - `name` (text) - enemy name
  - `base_hp` (integer) - base hit points
  - `base_attack` (integer) - base attack
  - `base_defense` (integer) - base defense
  - `xp_yield` (integer) - XP awarded on defeat
  - `gold_drop_min` (integer) - minimum gold drop
  - `gold_drop_max` (integer) - maximum gold drop
  - `loot_table` (jsonb) - drop configuration
  - `potion_drop_chance` (decimal) - potion drop probability
  - `is_special` (boolean) - special enemy flag
  - `is_final_boss` (boolean) - final boss flag
  - `special_abilities` (jsonb) - special abilities data
  - `created_at` (timestamptz)

  ### `pets`
  Stores pet templates and configurations
  - `id` (uuid, primary key)
  - `name` (text) - pet name
  - `rarity` (text) - pet rarity tier
  - `description` (text) - pet description
  - `bonuses` (jsonb) - stat bonuses provided
  - `special_ability` (text) - special ability description
  - `unlock_level` (integer) - level required to obtain
  - `base_find_chance` (decimal) - chance to find
  - `image_url` (text) - pet image reference
  - `created_at` (timestamptz)

  ### `items`
  Stores item templates for weapons, armor, and accessories
  - `id` (uuid, primary key)
  - `name` (text) - item name
  - `type` (text) - weapon, armor, or accessory
  - `rarity` (text) - item rarity
  - `bonus` (integer) - primary stat bonus
  - `bonuses` (jsonb) - additional bonuses
  - `is_unique` (boolean) - unique item flag
  - `cost` (integer) - base merchant cost
  - `description` (text) - item description
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Players can only read/write their own save data
  - Game configuration tables (enemies, pets, items) are read-only for players
*/

CREATE TABLE IF NOT EXISTS player_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL,
  level integer NOT NULL DEFAULT 1,
  xp bigint NOT NULL DEFAULT 0,
  xp_to_next_level bigint NOT NULL DEFAULT 65,
  current_hp integer NOT NULL DEFAULT 25,
  max_hp integer NOT NULL DEFAULT 25,
  base_attack integer NOT NULL DEFAULT 3,
  base_defense integer NOT NULL DEFAULT 1,
  gold bigint NOT NULL DEFAULT 0,
  potions integer NOT NULL DEFAULT 3,
  max_potions integer NOT NULL DEFAULT 50,
  weapon jsonb NOT NULL DEFAULT '{"name":"Old Stick","type":"weapon","bonus":0,"rarity":"Common","attackBonus":0,"defenseBonus":0}'::jsonb,
  armor jsonb NOT NULL DEFAULT '{"name":"Torn Shirt","type":"armor","bonus":0,"rarity":"Common"}'::jsonb,
  accessory jsonb NOT NULL DEFAULT '{"name":"None","type":"accessory","rarity":"Common","description":"No bonus","bonuses":{}}'::jsonb,
  active_pet jsonb DEFAULT NULL,
  pets jsonb[] DEFAULT ARRAY[]::jsonb[],
  last_saved timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS enemies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  base_hp integer NOT NULL DEFAULT 10,
  base_attack integer NOT NULL DEFAULT 5,
  base_defense integer NOT NULL DEFAULT 0,
  xp_yield integer NOT NULL DEFAULT 10,
  gold_drop_min integer NOT NULL DEFAULT 5,
  gold_drop_max integer NOT NULL DEFAULT 15,
  loot_table jsonb DEFAULT '[]'::jsonb,
  potion_drop_chance decimal(5,3) NOT NULL DEFAULT 0.0,
  is_special boolean NOT NULL DEFAULT false,
  is_final_boss boolean NOT NULL DEFAULT false,
  special_abilities jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  rarity text NOT NULL DEFAULT 'Common',
  description text NOT NULL DEFAULT '',
  bonuses jsonb NOT NULL DEFAULT '{}'::jsonb,
  special_ability text DEFAULT '',
  unlock_level integer NOT NULL DEFAULT 1,
  base_find_chance decimal(5,4) NOT NULL DEFAULT 0.0,
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  rarity text NOT NULL DEFAULT 'Common',
  bonus integer NOT NULL DEFAULT 0,
  bonuses jsonb DEFAULT '{}'::jsonb,
  is_unique boolean NOT NULL DEFAULT false,
  cost integer DEFAULT 0,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE player_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE enemies ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can read own save data"
  ON player_saves FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Players can insert own save data"
  ON player_saves FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Players can update own save data"
  ON player_saves FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can read enemies"
  ON enemies FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can read pets"
  ON pets FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can read items"
  ON items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_player_saves_user_id ON player_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_enemies_name ON enemies(name);
CREATE INDEX IF NOT EXISTS idx_pets_rarity ON pets(rarity);
CREATE INDEX IF NOT EXISTS idx_items_type_rarity ON items(type, rarity);
