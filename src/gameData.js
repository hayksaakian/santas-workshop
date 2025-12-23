// ============================================
// GAME DATA - Resources, Stations, and Eras
// ============================================

export const RESOURCES = {
  wood: { icon: '🪵', name: 'Wood' },
  fabric: { icon: '🧵', name: 'Fabric' },
  paint: { icon: '🎨', name: 'Paint' },
  stuffing: { icon: '☁️', name: 'Stuffing' },
  metal: { icon: '⚙️', name: 'Metal' },
  plastic: { icon: '🧱', name: 'Plastic' },
  rubber: { icon: '⚫', name: 'Rubber' },
  microchip: { icon: '💎', name: 'Microchip' },
  batteries: { icon: '🔋', name: 'Batteries' },
  screen: { icon: '📱', name: 'Screen' },
};

export const STATIONS = {
  sawmill: { name: 'Sawmill', icon: '🪵', color: 'bg-amber-700', produces: 'wood', time: 2 },
  fabric: { name: 'Fabric Cutter', icon: '🧵', color: 'bg-pink-400', produces: 'fabric', time: 2 },
  paint: { name: 'Paint Station', icon: '🎨', color: 'bg-blue-400', produces: 'paint', time: 2 },
  stuffing: { name: 'Stuffing Mill', icon: '☁️', color: 'bg-purple-300', produces: 'stuffing', time: 2 },
  metalworks: { name: 'Metalworks', icon: '⚙️', color: 'bg-slate-500', produces: 'metal', time: 3 },
  plasticMolder: { name: 'Plastic Molder', icon: '🧱', color: 'bg-pink-300', produces: 'plastic', time: 2 },
  rubberPress: { name: 'Rubber Press', icon: '⚫', color: 'bg-gray-700', produces: 'rubber', time: 2 },
  chipFoundry: { name: 'Chip Foundry', icon: '💎', color: 'bg-cyan-500', produces: 'microchip', time: 4 },
  batteryPlant: { name: 'Battery Plant', icon: '🔋', color: 'bg-green-500', produces: 'batteries', time: 3 },
  screenFactory: { name: 'Screen Factory', icon: '📱', color: 'bg-indigo-500', produces: 'screen', time: 4 },
  workshop: { name: 'Workshop Bench', icon: '🔨', color: 'bg-yellow-600', produces: null, time: 0, isWorkshop: true },
};

export const ERAS = [
  {
    id: '1880s', name: '1880s - Victorian', description: 'The golden age of handcrafted toys',
    elves: 4, orderTime: 100, ordersToWin: 8, resources: ['wood', 'fabric', 'paint', 'metal'],
    toys: {
      rockingHorse: { name: 'Rocking Horse', icon: '🐴', points: 100, recipe: { wood: 3, paint: 2 } },
      tinSoldier: { name: 'Tin Soldier', icon: '💂', points: 80, recipe: { metal: 2, paint: 1 } },
      ragDoll: { name: 'Rag Doll', icon: '🧸', points: 90, recipe: { fabric: 3, paint: 1 } },
      toyTrain: { name: 'Toy Train', icon: '🚂', points: 120, recipe: { wood: 2, metal: 2, paint: 1 } },
    }
  },
  {
    id: '1890s', name: '1890s - Late Victorian', description: 'Metal toys gain popularity',
    elves: 4, orderTime: 95, ordersToWin: 10, resources: ['wood', 'fabric', 'paint', 'metal'],
    toys: {
      castIronTrain: { name: 'Cast Iron Train', icon: '🚃', points: 130, recipe: { metal: 4, paint: 1 } },
      dollhouse: { name: 'Dollhouse', icon: '🏠', points: 150, recipe: { wood: 4, paint: 2, fabric: 1 } },
      musicBox: { name: 'Music Box', icon: '🎵', points: 110, recipe: { wood: 2, metal: 2 } },
      porcelainDoll: { name: 'Porcelain Doll', icon: '👧', points: 100, recipe: { fabric: 2, paint: 2 } },
    }
  },
  {
    id: '1900s', name: '1900s - Edwardian', description: 'The Teddy Bear is born',
    elves: 5, orderTime: 90, ordersToWin: 10, resources: ['wood', 'fabric', 'paint', 'metal', 'stuffing'],
    toys: {
      teddyBear: { name: 'Teddy Bear', icon: '🧸', points: 120, recipe: { fabric: 2, stuffing: 2, paint: 1 } },
      toyCar: { name: 'Toy Car', icon: '🚗', points: 100, recipe: { metal: 2, paint: 2 } },
      pullWagon: { name: 'Pull Wagon', icon: '🛒', points: 90, recipe: { wood: 3, metal: 1 } },
      crayons: { name: 'Crayons', icon: '🖍️', points: 70, recipe: { paint: 4 } },
    }
  },
  {
    id: '1910s', name: '1910s - WWI Era', description: 'Construction toys emerge',
    elves: 5, orderTime: 85, ordersToWin: 12, resources: ['wood', 'fabric', 'paint', 'metal', 'stuffing'],
    toys: {
      erectorSet: { name: 'Erector Set', icon: '🔩', points: 140, recipe: { metal: 4, paint: 1 } },
      lincolnLogs: { name: 'Lincoln Logs', icon: '🪵', points: 100, recipe: { wood: 5 } },
      raggedyAnn: { name: 'Raggedy Ann', icon: '🧶', points: 110, recipe: { fabric: 3, stuffing: 2, paint: 1 } },
      tinkerToys: { name: 'Tinker Toys', icon: '🎯', points: 90, recipe: { wood: 3, paint: 2 } },
    }
  },
  {
    id: '1920s', name: '1920s - Jazz Age', description: 'Rubber and outdoor toys',
    elves: 5, orderTime: 85, ordersToWin: 12, resources: ['wood', 'fabric', 'paint', 'metal', 'rubber'],
    toys: {
      yoyo: { name: 'Yo-Yo', icon: '🪀', points: 70, recipe: { wood: 2, paint: 1 } },
      toyAirplane: { name: 'Toy Airplane', icon: '✈️', points: 130, recipe: { wood: 2, metal: 2, paint: 1 } },
      pogoStick: { name: 'Pogo Stick', icon: '🦘', points: 120, recipe: { metal: 3, rubber: 2 } },
      chemistrySet: { name: 'Chemistry Set', icon: '🧪', points: 150, recipe: { metal: 2, paint: 3 } },
    }
  },
  {
    id: '1930s', name: '1930s - Depression Era', description: 'Board games and affordable toys',
    elves: 5, orderTime: 80, ordersToWin: 14, resources: ['wood', 'fabric', 'paint', 'metal', 'rubber', 'plastic', 'stuffing'],
    toys: {
      monopoly: { name: 'Monopoly', icon: '🎩', points: 100, recipe: { wood: 1, paint: 2, metal: 1 } },
      radioFlyer: { name: 'Radio Flyer', icon: '🛷', points: 140, recipe: { metal: 4, paint: 2, rubber: 1 } },
      sockMonkey: { name: 'Sock Monkey', icon: '🐵', points: 80, recipe: { fabric: 3, stuffing: 1 } },
      viewMaster: { name: 'View-Master', icon: '👓', points: 110, recipe: { plastic: 2, paint: 1 } },
    }
  },
  {
    id: '1940s', name: '1940s - WWII Era', description: 'Metal is scarce, innovation thrives',
    elves: 6, orderTime: 80, ordersToWin: 14, resources: ['wood', 'fabric', 'paint', 'metal', 'plastic', 'stuffing'],
    toys: {
      slinky: { name: 'Slinky', icon: '🌀', points: 90, recipe: { metal: 3 } },
      tonkaTruck: { name: 'Tonka Truck', icon: '🚚', points: 130, recipe: { metal: 4, paint: 2 } },
      scrabble: { name: 'Scrabble', icon: '🔤', points: 100, recipe: { wood: 3, paint: 2 } },
      candyLand: { name: 'Candy Land', icon: '🍭', points: 80, recipe: { paint: 3, wood: 1 } },
    }
  },
  {
    id: '1950s', name: '1950s - Post-War Boom', description: 'Plastic revolutionizes toys',
    elves: 6, orderTime: 75, ordersToWin: 16, resources: ['wood', 'fabric', 'paint', 'plastic', 'rubber', 'stuffing'],
    toys: {
      mrPotatoHead: { name: 'Mr. Potato Head', icon: '🥔', points: 90, recipe: { plastic: 3, paint: 1 } },
      barbie: { name: 'Barbie', icon: '👱‍♀️', points: 120, recipe: { plastic: 2, fabric: 2, paint: 2 } },
      hulaHoop: { name: 'Hula Hoop', icon: '⭕', points: 70, recipe: { plastic: 3 } },
      lego: { name: 'LEGO Set', icon: '🧱', points: 130, recipe: { plastic: 5, paint: 1 } },
    }
  },
  {
    id: '1960s', name: '1960s - Space Age', description: 'Action figures and the space race',
    elves: 6, orderTime: 75, ordersToWin: 16, resources: ['plastic', 'fabric', 'paint', 'metal', 'rubber', 'batteries'],
    toys: {
      giJoe: { name: 'G.I. Joe', icon: '🎖️', points: 120, recipe: { plastic: 3, fabric: 1, paint: 2 } },
      hotWheels: { name: 'Hot Wheels', icon: '🏎️', points: 100, recipe: { metal: 2, plastic: 2, paint: 1 } },
      easyBakeOven: { name: 'Easy-Bake Oven', icon: '🍰', points: 140, recipe: { metal: 3, plastic: 2, batteries: 1 } },
      etchASketch: { name: 'Etch A Sketch', icon: '🖼️', points: 110, recipe: { plastic: 3, metal: 2 } },
    }
  },
  {
    id: '1970s', name: '1970s - Electronic Dawn', description: 'First video games appear',
    elves: 7, orderTime: 70, ordersToWin: 18, resources: ['plastic', 'fabric', 'paint', 'rubber', 'batteries', 'microchip'],
    toys: {
      starWarsFigure: { name: 'Star Wars Figure', icon: '⚔️', points: 130, recipe: { plastic: 3, paint: 3 } },
      atari2600: { name: 'Atari 2600', icon: '🕹️', points: 200, recipe: { plastic: 3, microchip: 3, batteries: 1 } },
      simon: { name: 'Simon', icon: '🔴', points: 150, recipe: { plastic: 2, microchip: 2, batteries: 1 } },
      stretchArmstrong: { name: 'Stretch Armstrong', icon: '💪', points: 110, recipe: { rubber: 4, paint: 1 } },
    }
  },
  {
    id: '1980s', name: '1980s - Video Game Era', description: 'Transformers and Nintendo',
    elves: 7, orderTime: 70, ordersToWin: 18, resources: ['plastic', 'fabric', 'paint', 'batteries', 'microchip', 'stuffing'],
    toys: {
      transformers: { name: 'Transformers', icon: '🤖', points: 140, recipe: { plastic: 4, paint: 2 } },
      cabbagePatchKid: { name: 'Cabbage Patch Kid', icon: '👶', points: 120, recipe: { fabric: 3, stuffing: 2, paint: 1 } },
      nes: { name: 'NES', icon: '🎮', points: 220, recipe: { plastic: 3, microchip: 4, batteries: 1 } },
      rubiksCube: { name: "Rubik's Cube", icon: '🟩', points: 80, recipe: { plastic: 4 } },
    }
  },
  {
    id: '1990s', name: '1990s - Digital Pets', description: 'Virtual pets and portable gaming',
    elves: 7, orderTime: 65, ordersToWin: 20, resources: ['plastic', 'fabric', 'batteries', 'microchip', 'stuffing', 'screen'],
    toys: {
      tamagotchi: { name: 'Tamagotchi', icon: '🥚', points: 130, recipe: { plastic: 2, microchip: 2, batteries: 1, screen: 1 } },
      furby: { name: 'Furby', icon: '🦉', points: 160, recipe: { plastic: 2, fabric: 2, microchip: 2, batteries: 1 } },
      gameBoy: { name: 'Game Boy', icon: '🎮', points: 180, recipe: { plastic: 2, microchip: 3, batteries: 2, screen: 1 } },
      beanieBaby: { name: 'Beanie Baby', icon: '🐻', points: 90, recipe: { fabric: 3, stuffing: 2 } },
    }
  },
  {
    id: '2000s', name: '2000s - Internet Age', description: 'Connected toys and MP3 players',
    elves: 8, orderTime: 65, ordersToWin: 20, resources: ['plastic', 'fabric', 'paint', 'batteries', 'microchip', 'stuffing', 'screen'],
    toys: {
      iPod: { name: 'iPod', icon: '🎵', points: 200, recipe: { plastic: 2, microchip: 3, batteries: 2, screen: 2 } },
      xbox: { name: 'Xbox', icon: '🎮', points: 250, recipe: { plastic: 3, microchip: 5, batteries: 1 } },
      webkinz: { name: 'Webkinz', icon: '🐶', points: 100, recipe: { fabric: 3, stuffing: 2 } },
      bratz: { name: 'Bratz Doll', icon: '👧', points: 110, recipe: { plastic: 3, fabric: 1, paint: 2 } },
    }
  },
  {
    id: '2010s', name: '2010s - Tablet Era', description: 'Touchscreens everywhere',
    elves: 8, orderTime: 60, ordersToWin: 22, resources: ['plastic', 'fabric', 'paint', 'metal', 'batteries', 'microchip', 'stuffing', 'screen'],
    toys: {
      iPad: { name: 'iPad', icon: '📱', points: 250, recipe: { screen: 3, microchip: 4, batteries: 2 } },
      minecraftLego: { name: 'Minecraft LEGO', icon: '⛏️', points: 130, recipe: { plastic: 5, paint: 1 } },
      fidgetSpinner: { name: 'Fidget Spinner', icon: '🌀', points: 60, recipe: { plastic: 2, metal: 1 } },
      hatchimal: { name: 'Hatchimal', icon: '🥚', points: 170, recipe: { plastic: 2, fabric: 2, microchip: 2, batteries: 1 } },
    }
  },
  {
    id: '2020s', name: '2020s - Smart Toys', description: 'VR and connected everything',
    elves: 8, orderTime: 55, ordersToWin: 24, resources: ['plastic', 'fabric', 'batteries', 'microchip', 'stuffing', 'screen'],
    toys: {
      vrHeadset: { name: 'VR Headset', icon: '🥽', points: 280, recipe: { screen: 3, microchip: 4, plastic: 2, batteries: 2 } },
      drone: { name: 'Drone', icon: '🚁', points: 220, recipe: { plastic: 3, microchip: 3, batteries: 3 } },
      nintendoSwitch: { name: 'Nintendo Switch', icon: '🎮', points: 260, recipe: { screen: 2, microchip: 4, plastic: 2, batteries: 2 } },
      squishmallow: { name: 'Squishmallow', icon: '🛋️', points: 90, recipe: { fabric: 4, stuffing: 3 } },
    }
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

const RESOURCE_TO_STATION = {
  wood: 'sawmill',
  fabric: 'fabric',
  paint: 'paint',
  stuffing: 'stuffing',
  metal: 'metalworks',
  plastic: 'plasticMolder',
  rubber: 'rubberPress',
  microchip: 'chipFoundry',
  batteries: 'batteryPlant',
  screen: 'screenFactory',
};

export const getStationsForEra = (era) => {
  const availableStations = { workshop: STATIONS.workshop };
  era.resources.forEach(res => {
    const stationKey = RESOURCE_TO_STATION[res];
    if (stationKey && STATIONS[stationKey]) {
      availableStations[stationKey] = STATIONS[stationKey];
    }
  });
  return availableStations;
};

export const getInitialResources = (era) => {
  const resources = {};
  era.resources.forEach(res => { resources[res] = 0; });
  return resources;
};

// ============================================
// GAME CONSTANTS
// ============================================

export const GRID_SIZE = 6;
export const TICK_RATE = 1000;

// Children's names for orders
export const CHILDREN_NAMES = [
  'Timmy', 'Sally', 'Billy', 'Emma', 'Jack', 'Sophie', 'Oliver', 'Lily',
  'Charlie', 'Mia', 'Henry', 'Ava', 'George', 'Ella', 'Oscar', 'Grace',
  'Leo', 'Chloe', 'Max', 'Ruby', 'Archie', 'Ivy', 'Alfie', 'Freya',
  'Noah', 'Zoe', 'Ethan', 'Luna', 'Lucas', 'Willow', 'James', 'Aria',
  'Tommy', 'Rosie', 'Finn', 'Daisy', 'Jake', 'Poppy', 'Dylan', 'Bella',
  'Liam', 'Molly', 'Owen', 'Evie', 'Ryan', 'Isla', 'Sam', 'Holly',
];
export const MAX_SAD_CHILDREN = 5;
