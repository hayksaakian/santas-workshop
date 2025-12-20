import React, { useState, useEffect, useRef } from 'react';

// ============================================
// DATA (from rounds-data.js)
// ============================================

const RESOURCES = {
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

const STATIONS = {
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

const ERAS = [
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
    elves: 5, orderTime: 80, ordersToWin: 14, resources: ['wood', 'fabric', 'paint', 'metal', 'rubber', 'plastic'],
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
    elves: 8, orderTime: 65, ordersToWin: 20, resources: ['plastic', 'fabric', 'batteries', 'microchip', 'stuffing', 'screen'],
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

const getStationsForEra = (era) => {
  const resourceToStation = {
    wood: 'sawmill', fabric: 'fabric', paint: 'paint', stuffing: 'stuffing',
    metal: 'metalworks', plastic: 'plasticMolder', rubber: 'rubberPress',
    microchip: 'chipFoundry', batteries: 'batteryPlant', screen: 'screenFactory',
  };
  const availableStations = { workshop: STATIONS.workshop };
  era.resources.forEach(res => {
    const stationKey = resourceToStation[res];
    if (stationKey && STATIONS[stationKey]) {
      availableStations[stationKey] = STATIONS[stationKey];
    }
  });
  return availableStations;
};

const getInitialResources = (era) => {
  const resources = {};
  era.resources.forEach(res => { resources[res] = 0; });
  return resources;
};

// ============================================
// GAME LOGIC
// ============================================

const GRID_SIZE = 6;
const TICK_RATE = 1000;

const generateOrder = (era, orderCount) => {
  const toyKeys = Object.keys(era.toys);
  const toyKey = toyKeys[Math.floor(Math.random() * toyKeys.length)];
  const toy = era.toys[toyKey];
  const quantity = 1 + Math.floor(orderCount / 8);
  return {
    id: Date.now() + Math.random(),
    toyKey, toy, quantity,
    timeLeft: era.orderTime + Math.floor(Math.random() * 20),
    completed: 0,
  };
};

export default function SantasLogistics() {
  const [gamePhase, setGamePhase] = useState('menu');
  const [currentEraIndex, setCurrentEraIndex] = useState(0);

  const [grid, setGrid] = useState(() => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
  const [resources, setResources] = useState({});
  const [orders, setOrders] = useState([]);
  const [elves, setElves] = useState(0);
  const [assignedElves, setAssignedElves] = useState({});
  const [stationProgress, setStationProgress] = useState({});
  const [workshopJobs, setWorkshopJobs] = useState({});
  const [ordersCompleted, setOrdersCompleted] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  const [totalScore, setTotalScore] = useState(0);
  const [eraScore, setEraScore] = useState(0);

  const [stationModal, setStationModal] = useState(null);
  const [helpModal, setHelpModal] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [selectedTile, setSelectedTile] = useState(null);

  // Refs for tracking completions during tick (avoids nested setState issues)
  const pendingCompletions = useRef({ count: 0, score: 0 });

  const currentEra = ERAS[currentEraIndex];
  const availableStations = currentEra ? getStationsForEra(currentEra) : {};

  const startEra = () => {
    const era = ERAS[currentEraIndex];
    const newAvailableStations = getStationsForEra(era);

    // Filter grid to only keep stations available in new era
    const newGrid = grid.map(row =>
      row.map(cell => {
        if (!cell) return null;
        return newAvailableStations[cell] ? cell : null;
      })
    );

    // Filter elf assignments to only keep valid stations
    const newAssignedElves = {};
    let assignedCount = 0;
    Object.entries(assignedElves).forEach(([key, count]) => {
      const [x, y] = key.split('-').map(Number);
      if (newGrid[y]?.[x]) {
        newAssignedElves[key] = count;
        assignedCount += count;
      }
    });

    // Calculate unassigned elves (new era total minus currently assigned)
    const unassignedElves = Math.max(0, era.elves - assignedCount);

    setGrid(newGrid);
    setResources(getInitialResources(era));
    setOrders([]);
    setElves(unassignedElves);
    setAssignedElves(newAssignedElves);
    setStationProgress({});
    setWorkshopJobs({});
    setOrdersCompleted(0);
    setOrderCount(0);
    setEraScore(0);
    setExpandedOrder(null);
    setSelectedTile(null);
    setGamePhase('playing');
  };

  useEffect(() => {
    if (gamePhase !== 'playing') return;
    const interval = setInterval(() => {
      // Reset pending completions for this tick
      pendingCompletions.current = { count: 0, score: 0 };

      setStationProgress(prevProgress => {
        const newProgress = { ...prevProgress };
        grid.forEach((row, y) => {
          row.forEach((cell, x) => {
            if (!cell) return;
            const key = `${x}-${y}`;
            const elfCount = assignedElves[key] || 0;
            if (elfCount === 0) return;
            const station = STATIONS[cell];
            if (!station || station.isWorkshop) return;
            if (!newProgress[key]) newProgress[key] = 0;
            newProgress[key] += elfCount * 0.5;
            if (newProgress[key] >= station.time) {
              setResources(prev => ({ ...prev, [station.produces]: (prev[station.produces] || 0) + 1 }));
              newProgress[key] = 0;
            }
          });
        });
        return newProgress;
      });

      setOrders(prevOrders => {
        let newOrders = prevOrders.map(order => ({ ...order, timeLeft: order.timeLeft - 1 })).filter(order => order.timeLeft > 0);
        const claimedOrderIds = new Set();

        setWorkshopJobs(prevJobs => {
          const newJobs = { ...prevJobs };
          grid.forEach((row, y) => {
            row.forEach((cell, x) => {
              if (!cell) return;
              const station = STATIONS[cell];
              if (!station || !station.isWorkshop) return;
              const key = `${x}-${y}`;
              const elfCount = assignedElves[key] || 0;
              if (elfCount === 0) return;

              let job = newJobs[key];
              if (job) {
                job = { ...job, progress: job.progress + elfCount * 0.5 };
                newJobs[key] = job;
                if (job.progress >= job.craftTime) {
                  newOrders = newOrders.map(o => {
                    if (o.id === job.orderId) {
                      const newCompleted = o.completed + 1;
                      if (newCompleted >= o.quantity) {
                        const bonus = Math.floor(o.timeLeft / 10) * 10;
                        const points = o.toy.points * o.quantity + bonus;
                        // Track in ref instead of nested setState
                        pendingCompletions.current.count += 1;
                        pendingCompletions.current.score += points;
                        return { ...o, completed: newCompleted, status: 'done' };
                      }
                      return { ...o, completed: newCompleted };
                    }
                    return o;
                  });
                  delete newJobs[key];
                  job = null;
                }
              }

              if (!job) {
                setResources(prevResources => {
                  const availableOrder = newOrders.find(o => {
                    if (o.status === 'done') return false;
                    if (claimedOrderIds.has(o.id)) return false;
                    const recipe = o.toy.recipe;
                    for (const [res, amount] of Object.entries(recipe)) {
                      if ((prevResources[res] || 0) < amount) return false;
                    }
                    return true;
                  });

                  if (availableOrder) {
                    claimedOrderIds.add(availableOrder.id);
                    const recipe = availableOrder.toy.recipe;
                    const updatedResources = { ...prevResources };
                    for (const [res, amount] of Object.entries(recipe)) {
                      updatedResources[res] -= amount;
                    }
                    newJobs[key] = { orderId: availableOrder.id, toyKey: availableOrder.toyKey, progress: 0, craftTime: 5 };
                    return updatedResources;
                  }
                  return prevResources;
                });
              }
            });
          });
          return newJobs;
        });
        return newOrders.filter(o => o.status !== 'done');
      });

      // Flush pending completions after all state updates
      setTimeout(() => {
        if (pendingCompletions.current.count > 0) {
          setOrdersCompleted(c => c + pendingCompletions.current.count);
          setEraScore(s => s + pendingCompletions.current.score);
          setTotalScore(s => s + pendingCompletions.current.score);
        }
      }, 0);
    }, TICK_RATE);
    return () => clearInterval(interval);
  }, [gamePhase, grid, assignedElves]);

  useEffect(() => {
    if (gamePhase === 'playing' && ordersCompleted >= currentEra.ordersToWin) {
      setGamePhase('eraComplete');
    }
  }, [ordersCompleted, gamePhase, currentEra]);

  useEffect(() => {
    if (gamePhase !== 'playing') return;
    const interval = setInterval(() => {
      setOrders(prev => {
        if (prev.length < 5) {
          setOrderCount(c => c + 1);
          return [...prev, generateOrder(currentEra, orderCount)];
        }
        return prev;
      });
    }, 10000);
    if (orders.length === 0) {
      setOrders([generateOrder(currentEra, 0), generateOrder(currentEra, 0)]);
      setOrderCount(2);
    }
    return () => clearInterval(interval);
  }, [gamePhase, currentEra, orderCount]);

  const handleCellClick = (x, y) => {
    const key = `${x}-${y}`;
    const cell = grid[y][x];

    if (selectedTile) {
      const selectedKey = `${selectedTile.x}-${selectedTile.y}`;
      const selectedElfCount = assignedElves[selectedKey] || 0;

      if (selectedTile.x === x && selectedTile.y === y) {
        setSelectedTile(null);
        return;
      }

      if (cell && selectedElfCount > 0) {
        const targetElfCount = assignedElves[key] || 0;
        if (targetElfCount === 0) {
          setAssignedElves(prev => ({ ...prev, [selectedKey]: selectedElfCount - 1, [key]: 1 }));
        }
        setSelectedTile(null);
        return;
      }

      if (!cell) {
        setSelectedTile(null);
        setStationModal({ x, y });
        return;
      }
    }

    if (cell) {
      setSelectedTile({ x, y });
    } else {
      setStationModal({ x, y });
    }
  };

  const placeStation = (stationType) => {
    if (!stationModal) return;
    const { x, y } = stationModal;
    const newGrid = grid.map(row => [...row]);
    newGrid[y][x] = stationType;
    setGrid(newGrid);
    setStationModal(null);
    if (elves > 0) {
      const key = `${x}-${y}`;
      setElves(e => e - 1);
      setAssignedElves(prev => ({ ...prev, [key]: 1 }));
    }
  };

  const removeStation = (x, y) => {
    if (!grid[y][x]) return;
    const key = `${x}-${y}`;
    const freedElves = assignedElves[key] || 0;
    const newGrid = grid.map(row => [...row]);
    newGrid[y][x] = null;
    setGrid(newGrid);
    setElves(e => e + freedElves);
    setAssignedElves(prev => { const u = { ...prev }; delete u[key]; return u; });
    setStationProgress(prev => { const u = { ...prev }; delete u[key]; return u; });
    setWorkshopJobs(prev => { const u = { ...prev }; delete u[key]; return u; });
  };

  const deleteSelected = () => {
    if (!selectedTile) return;
    removeStation(selectedTile.x, selectedTile.y);
    setSelectedTile(null);
  };

  const canAffordRecipe = (recipe) => {
    for (const [res, amount] of Object.entries(recipe)) {
      if ((resources[res] || 0) < amount) return false;
    }
    return true;
  };

  const advanceEra = () => {
    if (currentEraIndex < ERAS.length - 1) {
      setCurrentEraIndex(i => i + 1);
      setGamePhase('eraIntro');
    } else {
      setGamePhase('gameWon');
    }
  };

  if (gamePhase === 'menu') {
    return (
      <div className="h-screen overflow-hidden bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="absolute text-white opacity-60 animate-pulse"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s`, fontSize: `${Math.random() * 10 + 8}px` }}>❄</div>
          ))}
        </div>
        <div className="bg-red-800 border-4 border-yellow-500 rounded-xl p-8 text-center shadow-2xl max-w-lg relative z-10">
          <h1 className="text-4xl font-bold text-yellow-300 mb-2">🎅 Santa's Logistics 🎄</h1>
          <p className="text-xs text-green-400 mb-1">v3 - speed test</p>
          <p className="text-green-300 italic mb-6">"Santa has magic delivery powers.<br/>You have the magic of logistics."</p>
          <div className="bg-red-900/50 rounded-lg p-4 mb-6 text-left text-green-100 text-sm">
            <p className="mb-3">Guide Santa's workshop through <strong className="text-yellow-300">15 decades</strong> of toy-making history!</p>
            <p>Each era brings new toys, new resources, and new challenges.</p>
          </div>
          <button onClick={() => {
            setGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
            setAssignedElves({});
            setGamePhase('eraIntro');
          }} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-full text-xl transition-all transform hover:scale-105 shadow-lg">
            🎁 Start Game 🎁
          </button>

          {/* Debug: Era selector */}
          <div className="mt-6 pt-4 border-t border-red-700">
            <p className="text-yellow-300 text-xs mb-2">⚙️ Debug: Jump to Era</p>
            <div className="flex flex-wrap gap-1 justify-center">
              {ERAS.map((era, idx) => (
                <button
                  key={era.id}
                  onClick={() => {
                    setCurrentEraIndex(idx);
                    setGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
                    setAssignedElves({});
                    setTotalScore(0);
                    setGamePhase('eraIntro');
                  }}
                  className="px-2 py-1 text-xs bg-red-700 hover:bg-red-600 text-white rounded"
                >
                  {era.id}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gamePhase === 'eraIntro') {
    const era = ERAS[currentEraIndex];
    return (
      <div className="h-screen overflow-hidden bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-red-800 border-4 border-yellow-500 rounded-xl p-6 text-center shadow-2xl max-w-md relative z-10">
          <p className="text-green-300 text-sm mb-1">Era {currentEraIndex + 1} of {ERAS.length}</p>
          <h1 className="text-3xl font-bold text-yellow-300 mb-2">{era.name}</h1>
          <p className="text-green-200 italic mb-4">{era.description}</p>
          <div className="bg-red-900/50 rounded-lg p-4 mb-4 text-left">
            <div className="flex justify-between text-sm text-green-100 mb-2">
              <span>🧝 Elves: <strong className="text-yellow-300">{era.elves}</strong></span>
              <span>🎯 Orders: <strong className="text-yellow-300">{era.ordersToWin}</strong></span>
            </div>
            <p className="text-green-300 text-xs mb-2">Toys this era:</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(era.toys).map(([key, toy]) => (
                <div key={key} className="bg-red-950/50 rounded p-2 text-xs">
                  <span className="text-lg">{toy.icon}</span>
                  <span className="text-white ml-1">{toy.name}</span>
                  <div className="text-amber-300 mt-1">
                    {Object.entries(toy.recipe).map(([r, n]) => (<span key={r} className="mr-1">{n}{RESOURCES[r]?.icon}</span>))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={startEra} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg">
            🏭 Start Era 🏭
          </button>
        </div>
      </div>
    );
  }

  if (gamePhase === 'eraComplete') {
    return (
      <div className="h-screen overflow-hidden bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-green-800 border-4 border-yellow-500 rounded-xl p-6 text-center shadow-2xl max-w-md relative z-10">
          <h1 className="text-3xl font-bold text-yellow-300 mb-2">🎉 Era Complete! 🎉</h1>
          <p className="text-green-200 mb-4">{currentEra.name}</p>
          <div className="bg-green-900/50 rounded-lg p-4 mb-4">
            <div className="text-green-100 space-y-2">
              <p>Orders Completed: <strong className="text-yellow-300">{ordersCompleted}</strong></p>
              <p>Era Score: <strong className="text-yellow-300">{eraScore}</strong></p>
              <p>Total Score: <strong className="text-yellow-300">{totalScore}</strong></p>
            </div>
          </div>
          <button onClick={advanceEra} className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg">
            {currentEraIndex < ERAS.length - 1 ? '➡️ Next Era' : '🏆 See Results'}
          </button>
        </div>
      </div>
    );
  }

  if (gamePhase === 'gameWon') {
    return (
      <div className="h-screen overflow-hidden bg-gradient-to-b from-yellow-600 via-yellow-500 to-orange-500 flex items-center justify-center p-4">
        <div className="bg-red-800 border-4 border-yellow-300 rounded-xl p-8 text-center shadow-2xl max-w-md relative z-10">
          <h1 className="text-4xl font-bold text-yellow-300 mb-4">🏆 You Did It! 🏆</h1>
          <p className="text-green-200 mb-4">You guided Santa's workshop through 140 years of toy-making history!</p>
          <div className="bg-red-900/50 rounded-lg p-4 mb-6">
            <p className="text-green-100 text-2xl">Final Score</p>
            <p className="text-yellow-300 text-4xl font-bold">{totalScore}</p>
          </div>
          <button onClick={() => {
            setCurrentEraIndex(0);
            setTotalScore(0);
            setGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
            setAssignedElves({});
            setGamePhase('menu');
          }} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg">
            🔄 Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-900 flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="absolute text-white opacity-40"
            style={{ left: `${Math.random() * 100}%`, top: `-20px`, animation: `fall ${5 + Math.random() * 5}s linear infinite`, animationDelay: `${Math.random() * 5}s`, fontSize: `${Math.random() * 8 + 6}px` }}>❄</div>
        ))}
      </div>
      <style>{`@keyframes fall { to { transform: translateY(100vh); } }`}</style>

      <div className="flex-shrink-0 flex justify-between items-center px-3 py-2 bg-red-900/80 border-b-2 border-red-700 relative z-10">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-bold text-yellow-300">{currentEra.name}</h1>
          <button onClick={() => setHelpModal(true)} className="w-5 h-5 rounded-full bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold">?</button>
        </div>
        <div className="flex gap-2 items-center text-xs">
          <div className="bg-green-800 px-2 py-1 rounded text-white">🧝 {elves}</div>
          <div className="bg-blue-800 px-2 py-1 rounded text-white">🎯 {ordersCompleted}/{currentEra.ordersToWin}</div>
          <div className="bg-yellow-600 px-2 py-1 rounded text-white">⭐ {totalScore}</div>
        </div>
      </div>

      <div className="flex-shrink-0 flex justify-center gap-2 px-2 py-1 bg-amber-900/60 border-b border-amber-700 relative z-10 flex-wrap">
        {currentEra.resources.map(key => (
          <div key={key} className="flex items-center gap-1 text-white text-xs">
            {RESOURCES[key]?.icon}<span className="font-bold">{resources[key] || 0}</span>
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col min-h-0 relative z-10">
        {/* Orders Panel - Horizontal */}
        <div className="flex-shrink-0 bg-red-900/80 border-b-2 border-red-700">
          <div className="flex items-center gap-2 px-2 py-1 border-b border-red-700">
            <h2 className="text-xs font-bold text-yellow-300">📜 Jobs</h2>
          </div>
          <div className="flex overflow-x-auto p-2 gap-2 scrollbar-hide">
            {orders.length === 0 ? (
              <p className="text-green-300 text-xs px-1 whitespace-nowrap">Waiting for orders...</p>
            ) : (
              orders.map(order => {
                const isExpanded = expandedOrder === order.id;
                const canAfford = canAffordRecipe(order.toy.recipe);
                const isCrafting = Object.values(workshopJobs).some(job => job && job.orderId === order.id);
                return (
                  <div key={order.id} onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    className={`flex-shrink-0 rounded-lg p-2 border text-xs cursor-pointer transition-all ${isCrafting ? 'bg-yellow-900/50 border-yellow-500' : canAfford ? 'bg-green-900/40 border-green-600' : 'bg-red-950/30 border-red-900/50 opacity-60'} ${isExpanded ? 'min-w-36' : 'min-w-20'}`}>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-white font-bold">{order.toy.icon} x{order.quantity}</span>
                      <span className={`font-mono text-xs ${order.timeLeft < 20 ? 'text-red-400' : 'text-green-400'}`}>{Math.round(order.timeLeft)}s</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-gray-400">{order.completed}/{order.quantity}</span>
                      <span className={`px-1 rounded ${isCrafting ? 'bg-yellow-600 text-white' : canAfford ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}>
                        {isCrafting ? '🔨' : canAfford ? '✓' : '⏳'}
                      </span>
                    </div>
                    {isExpanded && (
                      <div className={`mt-2 pt-2 border-t ${isCrafting ? 'border-yellow-700/50' : 'border-red-700/50'}`}>
                        <p className="text-gray-400 mb-1">Needs:</p>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(order.toy.recipe).map(([r, n]) => {
                            const have = resources[r] || 0;
                            const enough = have >= n;
                            return (<span key={r} className={`px-1.5 py-0.5 rounded ${enough ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'}`}>{RESOURCES[r]?.icon} {have}/{n}</span>);
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Workshop Grid */}
        <div className="flex-1 flex items-center justify-center p-2 md:p-4 min-w-0">
          <div className="bg-amber-900/80 rounded-xl p-2 md:p-4 border-2 border-amber-700 w-full max-w-md relative">
            <div className="grid gap-1 w-full aspect-square" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
              {grid.map((row, y) =>
                row.map((cell, x) => {
                  const key = `${x}-${y}`;
                  const progress = stationProgress[key] || 0;
                  const elfCount = assignedElves[key] || 0;
                  const station = cell ? STATIONS[cell] : null;
                  const job = workshopJobs[key];
                  const isSelected = selectedTile && selectedTile.x === x && selectedTile.y === y;
                  return (
                    <div key={key} onClick={() => handleCellClick(x, y)}
                      className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden
                        ${cell ? `${station.color} ${isSelected ? 'border-white ring-2 ring-white' : 'border-amber-400 hover:border-yellow-300'}` : 'bg-amber-800/30 border-amber-700/50 hover:bg-amber-700/50 hover:border-amber-500'}`}>
                      {cell ? (
                        <>
                          <span className="text-xl sm:text-2xl">{job ? currentEra.toys[job.toyKey]?.icon : station.icon}</span>
                          {elfCount > 0 && <span className="absolute top-0.5 right-0.5 text-xs sm:text-sm">🧝</span>}
                          {!station.isWorkshop && progress > 0 && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                              <div className="h-full bg-yellow-400" style={{ width: `${(progress / station.time) * 100}%`, transition: 'width 1s linear' }} />
                            </div>
                          )}
                          {station.isWorkshop && job && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                              <div className="h-full bg-green-400" style={{ width: `${(job.progress / job.craftTime) * 100}%`, transition: 'width 1s linear' }} />
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-amber-700/50 text-lg">+</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            {/* Trash can - always visible */}
            <button
              onClick={deleteSelected}
              disabled={!selectedTile || !grid[selectedTile.y]?.[selectedTile.x]}
              className={`absolute bottom-2 right-2 w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg border-2 transition-all
                ${selectedTile && grid[selectedTile.y]?.[selectedTile.x]
                  ? 'bg-red-600 hover:bg-red-500 border-red-400 cursor-pointer'
                  : 'bg-gray-700/50 border-gray-600/50 cursor-default opacity-50'}`}
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      {stationModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setStationModal(null)}>
          <div className="bg-amber-900 border-4 border-yellow-500 rounded-xl p-4 shadow-2xl max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-yellow-300 mb-3 text-center">Choose a Station</h3>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(availableStations).map(([key, station]) => (
                <button key={key} onClick={() => placeStation(key)} className={`${station.color} p-3 rounded-lg border-2 border-transparent hover:border-yellow-300 transition-all flex flex-col items-center gap-1`}>
                  <span className="text-2xl">{station.icon}</span>
                  <span className="text-white font-bold text-xs">{station.name}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setStationModal(null)} className="mt-3 w-full bg-red-700 hover:bg-red-600 text-white py-2 rounded-lg font-bold text-sm">Cancel</button>
          </div>
        </div>
      )}

      {helpModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setHelpModal(false)}>
          <div className="bg-red-900 border-4 border-yellow-500 rounded-xl p-4 shadow-2xl max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-yellow-300 mb-3 text-center">How to Play</h3>
            <div className="text-green-100 text-sm space-y-2">
              <p>• <strong>Tap empty squares</strong> to build stations</p>
              <p>• <strong>Tap a station</strong> to select it (white border)</p>
              <p>• <strong>Tap another station</strong> to move the elf there</p>
              <p>• <strong>Tap 🗑️</strong> to delete the selected station</p>
              <p>• <strong>Workshop Benches 🔨</strong> auto-craft orders</p>
              <p>• Complete <strong className="text-yellow-300">{currentEra.ordersToWin} orders</strong> to advance!</p>
            </div>
            <div className="mt-3 pt-3 border-t border-red-700">
              <p className="text-yellow-300 font-bold text-sm mb-2">This Era's Toys:</p>
              <div className="grid grid-cols-2 gap-1 text-xs text-green-100">
                {Object.entries(currentEra.toys).map(([key, toy]) => (
                  <div key={key} className="flex items-center gap-1">
                    <span>{toy.icon}</span>
                    <span className="text-amber-300">{Object.entries(toy.recipe).map(([r, n]) => (<span key={r}>{n}{RESOURCES[r]?.icon}</span>))}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setHelpModal(false)} className="mt-4 w-full bg-green-700 hover:bg-green-600 text-white py-2 rounded-lg font-bold text-sm">Got it!</button>
          </div>
        </div>
      )}
    </div>
  );
}
