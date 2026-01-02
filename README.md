# Santa's Workshop

A mobile-friendly logistics game where you manage Santa's toy workshop across different historical eras. Build resource stations, assign elves, and fulfill children's toy orders before time runs out!

## Gameplay

### Objective
Complete toy orders for children before they expire. Progress through 15 eras spanning from the 1870s to the 2020s, each with unique toys, resources, and challenges.

### Core Mechanics

**Resource Stations**
- Build stations (Sawmill, Fabric Cutter, Paint Station, etc.) to produce resources
- Assign elves to stations to start production
- Each station produces one resource type at a set rate

**Workshop Benches**
- Build workshops to craft toys from resources
- Elves automatically craft toys based on pending orders
- Completed toys go to inventory, then fulfill matching orders

**Adjacency Bonus**
- Place matching stations next to each other for a speed boost
- Each adjacent matching station (with an elf) gives +50% production speed
- Synced stations glow pink with floating musical notes

**Orders**
- Orders appear with a timer showing time remaining
- Each order requests a specific toy for a named child
- Orders show status: crafting (green), ready in inventory (blue), waiting (gray)
- Expired orders make children sad - too many sad children ends the game!

### Controls

**Desktop**
- Click empty cell to build a station
- Click station to select, click another to move elf
- Click trash icon to remove selected station

**Mobile**
- Tap empty cell to build a station
- Drag elves between stations to reassign them
- Tap station to select, use trash to remove

## Eras

The game spans 15 historical eras:

| Era | Grid | Elves | Key Resources |
|-----|------|-------|---------------|
| 1870s Tutorial | 3x3 | 2 | Wood, Fabric |
| 1880s Victorian | 4x4 | 4 | + Paint, Metal |
| 1900s Edwardian | 4x4 | 5 | + Stuffing |
| 1920s Jazz Age | 5x5 | 5 | + Rubber |
| 1930s Depression | 5x5 | 5 | + Plastic |
| 1950s Post-War | 5x5 | 6 | + Batteries |
| 1980s Digital | 6x6 | 7 | + Microchips |
| 2000s+ Modern | 6x6 | 8 | + Screens |

Each era introduces new toys with more complex recipes!

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **gh-pages** - Deployment

## Development

### Setup
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Deploy to GitHub Pages
```bash
npm run deploy
```

## Project Structure

```
src/
├── SantasLogistics.jsx  # Main game component
├── gameData.js          # Eras, toys, stations, resources
├── index.css            # Tailwind + custom styles
└── main.jsx             # Entry point
```

## Game Features

- **Dynamic Grid Size** - Grid grows from 3x3 to 6x6 as you progress
- **Toy Inventory System** - Crafted toys go to inventory, orders pull from it
- **Walking Elf Animations** - Elves animate when assigned to stations
- **Resource Feedback** - Floating emojis and pulse animations on production
- **Touch-Optimized** - Drag-and-drop elf reassignment on mobile
- **Pull-to-Refresh Disabled** - No accidental page reloads during play

## License

MIT
