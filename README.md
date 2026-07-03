# An Average RPG

A fantasy idle roguelite RPG with persistent bloodline progression. Every hero dies eventually. Their heir inherits consequences, debts, blessings, mutations, royal favors, curses, enemies, and banked relics.

## Core Concept

You are not one hero. You are a cursed family line. Death is progression - each fallen heir becomes family history, not a failed save.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + Radix UI
- **State**: Zustand + TanStack Query
- **Backend**: Firebase (Auth, Firestore, Functions, Storage)
- **Game Logic**: Rust (compiled to WASM for browser)
- **Desktop**: Tauri (planned)

## Project Structure

```
an-average-rpg/
├── apps/
│   ├── web/           # React + Vite frontend
│   └── admin/         # Admin tools (planned)
├── crates/
│   ├── game-core/     # Rust game simulation
│   └── game-wasm/     # WASM bindings
├── functions/         # Firebase Cloud Functions
├── packages/
│   └── shared/        # Shared TypeScript types
└── game-data/         # JSON game data files
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Rust (for game-core development)
- Firebase CLI

### Installation

```bash
# Install dependencies
pnpm install

# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Start Firebase emulators
firebase emulators:start
```

### Development

```bash
# Start web development server
pnpm dev

# Build for production
pnpm build

# Run Rust tests
cargo test --workspace
```

### Environment Variables

Copy `apps/web/.env.example` to `apps/web/.env.local` and fill in your Firebase config.

## Game Features (MVP 1)

- **4 Classes**: Fighter, Rogue, Mage, Cleric
- **4 Jobs**: Guard, Scribe, Blacksmith, Gravekeeper
- **10 Tavern Events**: Branching story encounters
- **3 Dungeons**: Goblin Caves, Undead Crypt, Dragon's Lair
- **20 Skills**: Web-shaped skill tree with lockouts
- **Bank System**: Store gold and items across generations
- **Death & Inheritance**: Full roguelite progression

## Architecture

```
GitHub Pages          Firebase
  └── Static App       ├── Auth
                       ├── Firestore (game state)
                       ├── Cloud Functions (authoritative logic)
                       └── Storage (assets)
```

All game-critical operations (combat, rewards, death, inheritance) are handled server-side via Cloud Functions. The client is untrusted.

## License

MIT

## Credits

- UI Icons: [Lucide](https://lucide.dev)
- Fonts: [Cinzel](https://fonts.google.com/specimen/Cinzel), [Inter](https://fonts.google.com/specimen/Inter)
