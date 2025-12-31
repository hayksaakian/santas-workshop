import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  RESOURCES,
  STATIONS,
  ERAS,
  getStationsForEra,
  getInitialResources,
  GRID_SIZE,
  TICK_RATE,
  MAX_SAD_CHILDREN,
  CHILDREN_NAMES,
} from './gameData';

// ============================================
// GAME LOGIC
// ============================================

const generateOrder = (era, orderCount, usedNames = []) => {
  const toyKeys = Object.keys(era.toys);
  const toyKey = toyKeys[Math.floor(Math.random() * toyKeys.length)];
  const toy = era.toys[toyKey];
  const quantity = 1 + Math.floor(orderCount / 8);
  // Pick a name not already in use
  const availableNames = CHILDREN_NAMES.filter(name => !usedNames.includes(name));
  const childName = availableNames.length > 0
    ? availableNames[Math.floor(Math.random() * availableNames.length)]
    : CHILDREN_NAMES[Math.floor(Math.random() * CHILDREN_NAMES.length)]; // Fallback if all names used
  return {
    id: Date.now() + Math.random(),
    toyKey, toy, quantity, childName,
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
  const [sadChildren, setSadChildren] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [builtToys, setBuiltToys] = useState({});
  const [toyInventory, setToyInventory] = useState({}); // Completed toys waiting to fulfill orders

  const [totalScore, setTotalScore] = useState(0);
  const [eraScore, setEraScore] = useState(0);

  const [stationModal, setStationModal] = useState(null);
  const [helpModal, setHelpModal] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [selectedTile, setSelectedTile] = useState(null);
  const [sadChildFlash, setSadChildFlash] = useState(0); // 0 = no flash, 1+ = intensity
  const [sadChildrenNames, setSadChildrenNames] = useState([]);
  const [walkingElves, setWalkingElves] = useState([]); // elves currently animating
  const [recentArrivals, setRecentArrivals] = useState(new Set()); // cells with newly arrived elves
  const [floatingResources, setFloatingResources] = useState([]); // floating emoji animations
  const [floatingToys, setFloatingToys] = useState([]); // floating toy emoji when crafted
  const [recentResources, setRecentResources] = useState(new Set()); // resources that were just generated (for pulse)
  const [draggingElf, setDraggingElf] = useState(null); // { sourceKey, sourceX, sourceY } when dragging
  const [floatingNotes, setFloatingNotes] = useState([]); // floating musical notes for synced stations

  // Refs for tracking completions during tick (avoids nested setState issues)
  const pendingCompletions = useRef({ count: 0, score: 0, toys: [] });
  const pendingResources = useRef([]); // Track resources generated this tick for floating animation
  const pendingToys = useRef([]); // Track toys crafted this tick for inventory
  const ordersRef = useRef([]);
  const prevSadChildren = useRef(0);
  const gridRef = useRef(null);
  const cellRefs = useRef({}); // Track cell DOM elements for accurate positioning
  const idleAreaRef = useRef(null); // Track idle elves area for walking animation start
  const dragPositionRef = useRef({ x: 0, y: 0 }); // Track drag position without re-renders
  const dragElfRef = useRef(null); // Ref to the dragging elf element for direct DOM updates

  // Memoize snowflake positions so they don't reset on every render
  const snowflakes = useMemo(() =>
    [...Array(30)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 5 + Math.random() * 5,
      delay: Math.random() * 5,
      size: Math.random() * 8 + 6,
    })), []);

  // Menu screen snowflakes (stationary, pulsing)
  const menuSnowflakes = useMemo(() =>
    [...Array(50)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      size: Math.random() * 10 + 8,
    })), []);

  const currentEra = ERAS[currentEraIndex];
  const availableStations = currentEra ? getStationsForEra(currentEra) : {};

  // Scale icon sizes based on grid size (smaller grid = bigger cells = bigger icons)
  const iconSizes = useMemo(() => {
    const gridSize = currentEra?.gridSize || 6;
    if (gridSize <= 3) return { station: 'text-4xl', toy: 'text-3xl', elf: 'text-base', plus: 'text-2xl', hammer: 'text-lg' };
    if (gridSize <= 4) return { station: 'text-3xl', toy: 'text-2xl', elf: 'text-sm', plus: 'text-xl', hammer: 'text-base' };
    if (gridSize <= 5) return { station: 'text-2xl', toy: 'text-xl', elf: 'text-sm', plus: 'text-lg', hammer: 'text-sm' };
    return { station: 'text-xl sm:text-2xl', toy: 'text-lg sm:text-xl', elf: 'text-xs sm:text-sm', plus: 'text-lg', hammer: 'text-sm' };
  }, [currentEra?.gridSize]);

  // Helper to count adjacent matching stations with elves (cardinal directions only)
  const getAdjacentBonus = (x, y, stationType, gridData, elfData) => {
    const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]]; // up, down, left, right
    let count = 0;
    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || ny >= gridData.length || nx >= gridData[0].length) continue;
      const neighborCell = gridData[ny]?.[nx];
      if (neighborCell === stationType && (elfData[`${nx}-${ny}`] || 0) > 0) {
        count++;
      }
    }
    return count;
  };

  // Calculate synced pairs for visual feedback (cells that have adjacency bonus)
  const syncedCells = useMemo(() => {
    const synced = new Set();
    const gridSize = currentEra?.gridSize || 6;
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const cell = grid[y]?.[x];
        if (!cell) continue;
        const elfCount = assignedElves[`${x}-${y}`] || 0;
        if (elfCount === 0) continue;
        const bonus = getAdjacentBonus(x, y, cell, grid, assignedElves);
        if (bonus > 0) {
          synced.add(`${x}-${y}`);
        }
      }
    }
    return synced;
  }, [grid, assignedElves, currentEra?.gridSize]);

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
    ordersRef.current = [];
    pendingCompletions.current = { count: 0, score: 0, toys: [] };
    pendingToys.current = [];
    setElves(unassignedElves);
    setBuiltToys({});
    setToyInventory({});
    setAssignedElves(newAssignedElves);
    setStationProgress({});
    setWorkshopJobs({});
    setOrdersCompleted(0);
    setSadChildren(0);
    setSadChildrenNames([]);
    prevSadChildren.current = 0;
    setOrderCount(0);
    setEraScore(0);
    setExpandedOrder(null);
    setSelectedTile(null);
    setGamePhase('playing');
  };

  useEffect(() => {
    if (gamePhase !== 'playing') return;
    const interval = setInterval(() => {
      // Count expired orders synchronously using ref (React 18 batches setState)
      // Only count orders that are about to expire (timeLeft <= 1) and haven't already been marked as expiring
      const expiringOrders = ordersRef.current.filter(order =>
        order.timeLeft <= 1 && order.status !== 'done' && order.status !== 'expiring'
      );
      const expiredThisTick = expiringOrders.length;
      const expiredChildNames = expiringOrders.map(o => ({ name: o.childName, toy: o.toy.icon }));

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
            // Apply adjacency bonus: +50% per adjacent matching station with elves
            const adjacentCount = getAdjacentBonus(x, y, cell, grid, assignedElves);
            const speedMultiplier = 1 + (0.5 * adjacentCount);
            newProgress[key] += elfCount * 0.5 * speedMultiplier;
            if (newProgress[key] >= station.time) {
              setResources(prev => ({ ...prev, [station.produces]: (prev[station.produces] || 0) + 1 }));
              pendingResources.current.push({ resourceKey: station.produces, cellKey: key });
              newProgress[key] = 0;
            }
          });
        });
        return newProgress;
      });

      // Use a ref to track order modifications across nested setState calls
      const ordersModRef = { current: null };
      const jobsModRef = { current: null };
      const claimedOrderIds = new Set();

      setOrders(prevOrders => {
        // First, remove orders that were marked as expiring in the previous tick
        const withoutExpired = prevOrders.filter(order => order.status !== 'expiring');
        // Also filter out any done orders that might have slipped through
        const withoutDone = withoutExpired.filter(order => order.status !== 'done');
        // Decrement time and mark newly expiring orders
        const updatedOrders = withoutDone.map(order => {
          const newTimeLeft = order.timeLeft - 1;
          if (newTimeLeft <= 0) {
            return { ...order, timeLeft: 0, status: 'expiring' };
          }
          return { ...order, timeLeft: newTimeLeft };
        });
        ordersModRef.current = updatedOrders;
        return updatedOrders; // Will be updated again by setWorkshopJobs effect
      });

      setWorkshopJobs(prevJobs => {
        const newJobs = { ...prevJobs };
        // Get current orders from ref (updated by setOrders above)
        const currentOrders = ordersModRef.current || ordersRef.current;
        // Track which toy types are already being crafted this tick to avoid duplicates
        const craftingToyTypes = new Set();

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
              // Mark this toy type as being worked on
              craftingToyTypes.add(job.toyKey);

              // Apply adjacency bonus: +50% per adjacent matching station with elves
              const adjacentCount = getAdjacentBonus(x, y, cell, grid, assignedElves);
              const speedMultiplier = 1 + (0.5 * adjacentCount);
              job = { ...job, progress: job.progress + elfCount * 0.5 * speedMultiplier };
              newJobs[key] = job;

              if (job.progress >= job.craftTime) {
                // Toy completed - add to pending inventory (not directly to order)
                const toy = currentEra.toys[job.toyKey];
                if (toy) {
                  pendingToys.current.push({ toyKey: job.toyKey, cellKey: key, toyIcon: toy.icon });
                }
                delete newJobs[key];
                job = null;
              }
            }

            if (!job) {
              // Find a toy type that's needed by pending orders
              setResources(prevResources => {
                // Find an order that needs a toy we're not already crafting
                const neededOrder = currentOrders.find(o => {
                  if (o.status === 'done' || o.status === 'expiring') return false;
                  if (craftingToyTypes.has(o.toyKey)) return false;
                  const recipe = o.toy.recipe;
                  for (const [res, amount] of Object.entries(recipe)) {
                    if ((prevResources[res] || 0) < amount) return false;
                  }
                  return true;
                });

                if (neededOrder) {
                  craftingToyTypes.add(neededOrder.toyKey);
                  const recipe = neededOrder.toy.recipe;
                  const updatedResources = { ...prevResources };
                  for (const [res, amount] of Object.entries(recipe)) {
                    updatedResources[res] -= amount;
                  }
                  // Job only tracks toyKey, not orderId
                  newJobs[key] = { toyKey: neededOrder.toyKey, progress: 0, craftTime: 5 };
                  return updatedResources;
                }
                return prevResources;
              });
            }
          });
        });

        return newJobs;
      });

      // Fulfill orders from toy inventory
      setToyInventory(prevInventory => {
        const currentOrders = ordersModRef.current || ordersRef.current;
        let inventory = { ...prevInventory };
        let ordersChanged = false;

        // Try to fulfill each pending order from inventory
        const updatedOrders = currentOrders.map(order => {
          if (order.status === 'done' || order.status === 'expiring') return order;

          const available = inventory[order.toyKey] || 0;
          const needed = order.quantity - order.completed;

          if (available > 0 && needed > 0) {
            const toFulfill = Math.min(available, needed);
            inventory[order.toyKey] = available - toFulfill;
            const newCompleted = order.completed + toFulfill;
            ordersChanged = true;

            if (newCompleted >= order.quantity) {
              // Order fully completed
              const bonus = Math.floor(order.timeLeft / 10) * 10;
              const points = order.toy.points * order.quantity + bonus;
              pendingCompletions.current.count += 1;
              pendingCompletions.current.score += points;
              pendingCompletions.current.toys.push({
                toyKey: order.toyKey,
                quantity: order.quantity,
                cellKey: null,
                toyIcon: order.toy.icon
              });
              return { ...order, completed: newCompleted, status: 'done' };
            }
            return { ...order, completed: newCompleted };
          }
          return order;
        });

        // Always filter out completed orders and sync ref
        const finalOrders = updatedOrders.filter(o => o.status !== 'done');
        ordersRef.current = finalOrders;

        if (ordersChanged) {
          setOrders(finalOrders);
        }

        return inventory;
      });

      // Flush pending completions after all state updates
      // Read inside setTimeout so React has processed the setState callbacks
      setTimeout(() => {
        const completedCount = pendingCompletions.current.count;
        const completedScore = pendingCompletions.current.score;
        const completedToys = pendingCompletions.current.toys;
        const generatedResources = pendingResources.current;
        const craftedToys = pendingToys.current;
        // Reset after reading
        pendingCompletions.current = { count: 0, score: 0, toys: [] };
        pendingResources.current = [];
        pendingToys.current = [];

        // Add crafted toys to inventory
        if (craftedToys.length > 0) {
          setToyInventory(prev => {
            const updated = { ...prev };
            craftedToys.forEach(({ toyKey }) => {
              updated[toyKey] = (updated[toyKey] || 0) + 1;
            });
            return updated;
          });
          // Spawn floating toy emojis for crafted toys
          const toyFloaters = craftedToys.map(({ cellKey, toyIcon }) => ({
            id: Date.now() + Math.random(),
            cellKey,
            icon: toyIcon,
          }));
          setFloatingToys(prev => [...prev, ...toyFloaters]);
          setTimeout(() => {
            setFloatingToys(prev => prev.filter(f => !toyFloaters.some(t => t.id === f.id)));
          }, 1000);
        }

        if (completedCount > 0) {
          setOrdersCompleted(c => c + completedCount);
          setEraScore(s => s + completedScore);
          setTotalScore(s => s + completedScore);
          // Add completed orders to built toys collection (for stats)
          setBuiltToys(prev => {
            const updated = { ...prev };
            completedToys.forEach(({ toyKey, quantity }) => {
              updated[toyKey] = (updated[toyKey] || 0) + quantity;
            });
            return updated;
          });
        }
        if (expiredThisTick > 0) {
          setSadChildren(c => c + expiredThisTick);
          setSadChildrenNames(prev => [...prev, ...expiredChildNames]);
        }
        // Spawn floating resource emojis
        if (generatedResources.length > 0) {
          const newFloaters = generatedResources.map(({ resourceKey, cellKey }) => ({
            id: Date.now() + Math.random(),
            resourceKey,
            cellKey,
          }));
          setFloatingResources(prev => [...prev, ...newFloaters]);
          // Track which resources were generated for pulse animation
          const resourceKeys = new Set(generatedResources.map(r => r.resourceKey));
          setRecentResources(resourceKeys);
          // Clear floating resources after animation
          setTimeout(() => {
            setFloatingResources(prev => prev.filter(f => !newFloaters.some(n => n.id === f.id)));
          }, 1000);
          // Clear pulse after animation
          setTimeout(() => {
            setRecentResources(new Set());
          }, 500);
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
    if (gamePhase === 'playing' && sadChildren >= MAX_SAD_CHILDREN) {
      setGamePhase('christmasRuined');
    }
  }, [sadChildren, gamePhase]);

  // Flash animation when a child becomes sad - intensity based on number of failures
  useEffect(() => {
    if (sadChildren > prevSadChildren.current && gamePhase === 'playing') {
      const intensity = sadChildren - prevSadChildren.current;
      setSadChildFlash(intensity);
      const timer = setTimeout(() => setSadChildFlash(0), 1500 + intensity * 300);
      return () => clearTimeout(timer);
    }
    prevSadChildren.current = sadChildren;
  }, [sadChildren, gamePhase]);

  // Spawn floating musical notes for synced stations
  useEffect(() => {
    if (gamePhase !== 'playing' || syncedCells.size === 0) return;
    const spawnNote = () => {
      const syncedArray = Array.from(syncedCells);
      const randomCell = syncedArray[Math.floor(Math.random() * syncedArray.length)];
      const noteEmoji = ['🎵', '🎶', '♪'][Math.floor(Math.random() * 3)];
      const newNote = { id: Date.now() + Math.random(), cellKey: randomCell, emoji: noteEmoji };
      setFloatingNotes(prev => [...prev, newNote]);
      setTimeout(() => {
        setFloatingNotes(prev => prev.filter(n => n.id !== newNote.id));
      }, 1500);
    };
    // Spawn a note immediately and then every 800ms
    spawnNote();
    const interval = setInterval(spawnNote, 800);
    return () => clearInterval(interval);
  }, [gamePhase, syncedCells]);

  useEffect(() => {
    if (gamePhase !== 'playing') return;
    const interval = setInterval(() => {
      setOrders(prev => {
        if (prev.length < 5) {
          setOrderCount(c => c + 1);
          const usedNames = prev.map(o => o.childName);
          const newOrders = [...prev, generateOrder(currentEra, orderCount, usedNames)];
          ordersRef.current = newOrders;
          return newOrders;
        }
        return prev;
      });
    }, 10000);
    if (orders.length === 0) {
      const firstOrder = generateOrder(currentEra, 0, []);
      const secondOrder = generateOrder(currentEra, 0, [firstOrder.childName]);
      const initialOrders = [firstOrder, secondOrder];
      ordersRef.current = initialOrders;
      setOrders(initialOrders);
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
          spawnWalkingElf(x, y, { x: selectedTile.x, y: selectedTile.y }); // Animate elf walking
          // Remove from source immediately, add to destination after animation
          setAssignedElves(prev => ({ ...prev, [selectedKey]: selectedElfCount - 1 }));
          setTimeout(() => {
            setRecentArrivals(prev => new Set([...prev, key]));
            setAssignedElves(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
            // Clear arrival status after appear animation
            setTimeout(() => setRecentArrivals(prev => {
              const next = new Set(prev);
              next.delete(key);
              return next;
            }), 300);
          }, 600);
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

  // Drag and drop handlers for elf reassignment
  const handleDragStart = (x, y, e) => {
    const key = `${x}-${y}`;
    const elfCount = assignedElves[key] || 0;
    if (elfCount === 0) return;

    e.preventDefault(); // Prevent scrolling
    const touch = e.touches[0];
    dragPositionRef.current = { x: touch.clientX, y: touch.clientY };
    setDraggingElf({ sourceKey: key, sourceX: x, sourceY: y });
    setSelectedTile(null); // Clear any selection
  };

  const handleDragMove = (e) => {
    if (!draggingElf) return;
    e.preventDefault();
    const touch = e.touches[0];
    dragPositionRef.current = { x: touch.clientX, y: touch.clientY };
    // Update elf position directly via ref for performance
    if (dragElfRef.current) {
      dragElfRef.current.style.left = `${touch.clientX}px`;
      dragElfRef.current.style.top = `${touch.clientY}px`;
    }
  };

  const handleDragEnd = (e) => {
    if (!draggingElf) return;

    // Find which cell we're over
    const touch = e.changedTouches[0];
    const dropX = touch.clientX;
    const dropY = touch.clientY;

    let targetKey = null;
    let targetX = null;
    let targetY = null;

    // Check each cell to see if drop point is inside
    for (const [key, cellEl] of Object.entries(cellRefs.current)) {
      if (!cellEl) continue;
      const rect = cellEl.getBoundingClientRect();
      if (dropX >= rect.left && dropX <= rect.right && dropY >= rect.top && dropY <= rect.bottom) {
        const [cx, cy] = key.split('-').map(Number);
        // Only allow drop on cells with stations, no existing elf, and not the source
        const targetElfCount = assignedElves[key] || 0;
        if (grid[cy]?.[cx] && key !== draggingElf.sourceKey && targetElfCount === 0) {
          targetKey = key;
          targetX = cx;
          targetY = cy;
        }
        break;
      }
    }

    if (targetKey) {
      // Move elf from source to target
      const sourceKey = draggingElf.sourceKey;
      const sourceElfCount = assignedElves[sourceKey] || 0;

      spawnWalkingElf(targetX, targetY, { x: draggingElf.sourceX, y: draggingElf.sourceY });
      setAssignedElves(prev => ({ ...prev, [sourceKey]: sourceElfCount - 1 }));

      setTimeout(() => {
        setRecentArrivals(prev => new Set([...prev, targetKey]));
        setAssignedElves(prev => ({ ...prev, [targetKey]: (prev[targetKey] || 0) + 1 }));
        setTimeout(() => setRecentArrivals(prev => {
          const next = new Set(prev);
          next.delete(targetKey);
          return next;
        }), 300);
      }, 600);
    }

    setDraggingElf(null);
  };

  // Spawn a walking elf animation using actual DOM positions
  const spawnWalkingElf = (toX, toY, fromStation = null, capturedIdlePos = null) => {
    const id = Date.now() + Math.random();
    const destKey = `${toX}-${toY}`;

    // Get actual pixel positions from DOM
    const gridEl = gridRef.current;
    const destCell = cellRefs.current[destKey];
    const sourceCell = fromStation ? cellRefs.current[`${fromStation.x}-${fromStation.y}`] : null;

    if (!gridEl || !destCell) {
      // Fallback: just skip animation if we can't get positions
      return destKey;
    }

    const gridRect = gridEl.getBoundingClientRect();
    const destRect = destCell.getBoundingClientRect();

    // Calculate destination position (top-right corner of cell, relative to grid)
    const destLeft = destRect.right - gridRect.left - 8; // 8px offset for elf size
    const destTop = destRect.top - gridRect.top + 2;

    // Calculate source position
    let fromLeft, fromTop;
    if (sourceCell) {
      const sourceRect = sourceCell.getBoundingClientRect();
      fromLeft = sourceRect.right - gridRect.left - 8;
      fromTop = sourceRect.top - gridRect.top + 2;
    } else if (capturedIdlePos) {
      // Use pre-captured idle position (before idle area was potentially removed)
      fromLeft = capturedIdlePos.left - gridRect.left;
      fromTop = capturedIdlePos.bottom - gridRect.top;
    } else {
      // Fallback: center top of grid
      fromLeft = gridRect.width / 2;
      fromTop = -20;
    }

    const elf = { id, toX, toY, fromStation, destKey, fromLeft, fromTop, destLeft, destTop };
    setWalkingElves(prev => [...prev, elf]);

    // Remove after animation completes
    setTimeout(() => {
      setWalkingElves(prev => prev.filter(e => e.id !== id));
    }, 700);
    return destKey;
  };

  const placeStation = (stationType) => {
    if (!stationModal) return;
    const { x, y } = stationModal;
    const key = `${x}-${y}`;
    const newGrid = grid.map(row => [...row]);
    newGrid[y][x] = stationType;

    // Capture idle area position BEFORE updating state (it might disappear if this is the last elf)
    let idlePos = null;
    if (elves > 0 && idleAreaRef.current) {
      const rect = idleAreaRef.current.getBoundingClientRect();
      idlePos = { left: rect.left + rect.width / 2, bottom: rect.bottom };
    }

    setGrid(newGrid);
    setStationModal(null);
    if (elves > 0) {
      setElves(e => e - 1);
      // Wait for the cell to be rendered before spawning walking elf
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          spawnWalkingElf(x, y, null, idlePos); // Animate elf walking from idle area
        });
      });
      // Delay showing the stationed elf until animation completes (matches 0.6s transition)
      setTimeout(() => {
        setRecentArrivals(prev => new Set([...prev, key]));
        setAssignedElves(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
        // Clear arrival status after appear animation
        setTimeout(() => setRecentArrivals(prev => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        }), 300);
      }, 600);
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
          {menuSnowflakes.map((flake) => (
            <div key={flake.id} className="absolute text-white opacity-60 animate-pulse"
              style={{ left: `${flake.left}%`, top: `${flake.top}%`, animationDelay: `${flake.delay}s`, fontSize: `${flake.size}px` }}>❄</div>
          ))}
        </div>
        <div className="bg-red-800 border-4 border-yellow-500 rounded-xl p-8 text-center shadow-2xl max-w-lg relative z-10">
          <h1 className="text-4xl font-bold text-yellow-300 mb-2">🎅 Santa's Workshop Simulator 🎄</h1>
          <p className="text-xs text-green-400 mb-1">v18 - drag and drop elves</p>
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
    const totalToysBuilt = Object.values(builtToys).reduce((sum, count) => sum + count, 0);
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
            {totalToysBuilt > 0 && (
              <div className="mt-3 pt-3 border-t border-green-700">
                <p className="text-green-300 text-sm mb-2">🎁 Toys Built: {totalToysBuilt}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {Object.entries(builtToys).map(([toyKey, count]) => (
                    <div key={toyKey} className="flex items-center bg-green-700/50 rounded-full px-2 py-1">
                      <span className="text-lg">{currentEra.toys[toyKey]?.icon}</span>
                      <span className="text-green-200 text-sm ml-1">×{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button onClick={advanceEra} className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg">
            {currentEraIndex < ERAS.length - 1 ? '➡️ Next Era' : '🏆 See Results'}
          </button>
        </div>
      </div>
    );
  }

  if (gamePhase === 'christmasRuined') {
    return (
      <div className="h-screen overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-blue-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 border-4 border-red-500 rounded-xl p-6 text-center shadow-2xl max-w-md relative z-10">
          <h1 className="text-3xl font-bold text-red-400 mb-2">😢 Christmas is Ruined! 😢</h1>
          <p className="text-gray-300 mb-4">{currentEra.name}</p>
          <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
            <div className="text-gray-200 space-y-2">
              <p>Too many children were left without toys...</p>
              <p>Orders Completed: <strong className="text-yellow-300">{ordersCompleted}/{currentEra.ordersToWin}</strong></p>
            </div>
            {sadChildrenNames.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-red-400 text-sm mb-2">Children left without presents:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {sadChildrenNames.map((child, idx) => (
                    <div key={idx} className="flex items-center bg-red-900/50 rounded-full px-2 py-1 text-xs">
                      <span className="text-red-300">{child.name}</span>
                      <span className="ml-1">{child.toy}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => {
              startEra();
            }} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg">
              🔄 Try Again
            </button>
            <button onClick={() => {
              setGamePhase('menu');
              setTotalScore(0);
              setCurrentEraIndex(0);
            }} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg">
              🏠 Menu
            </button>
          </div>
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
        {snowflakes.map((flake) => (
          <div key={flake.id} className="absolute text-white opacity-40"
            style={{ left: `${flake.left}%`, top: `-20px`, animation: `fall ${flake.duration}s linear infinite`, animationDelay: `${flake.delay}s`, fontSize: `${flake.size}px` }}>❄</div>
        ))}
      </div>
      <style>{`
        @keyframes fall { to { transform: translateY(100vh); } }
        @keyframes elfWork {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes elfAppear {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes elfIdle {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-2px) rotate(-5deg); }
          75% { transform: translateY(-2px) rotate(5deg); }
        }
        @keyframes elfWalk {
          0% { transform: translate(-50%, -50%) translateY(0); }
          25% { transform: translate(-50%, -50%) translateY(-4px) rotate(-10deg); }
          50% { transform: translate(-50%, -50%) translateY(0); }
          75% { transform: translate(-50%, -50%) translateY(-4px) rotate(10deg); }
          100% { transform: translate(-50%, -50%) translateY(0); }
        }
        @keyframes sadPulse {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.3); background-color: #dc2626; }
          50% { transform: scale(1.1); }
          75% { transform: scale(1.2); background-color: #dc2626; }
        }
        @keyframes sadPulseIntense {
          0%, 100% { transform: scale(1) rotate(0deg); }
          10% { transform: scale(1.5) rotate(-3deg); background-color: #dc2626; }
          20% { transform: scale(1.3) rotate(3deg); }
          30% { transform: scale(1.6) rotate(-2deg); background-color: #b91c1c; }
          40% { transform: scale(1.2) rotate(2deg); }
          50% { transform: scale(1.5) rotate(-3deg); background-color: #dc2626; }
          60% { transform: scale(1.3) rotate(3deg); }
          70% { transform: scale(1.4) rotate(-2deg); background-color: #b91c1c; }
          80% { transform: scale(1.2) rotate(2deg); }
          90% { transform: scale(1.3) rotate(-1deg); background-color: #dc2626; }
        }
        @keyframes floatUp {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-60px) scale(1.5); }
        }
        @keyframes resourcePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
        @keyframes orderExpire {
          0% { transform: scale(1) rotate(0deg); opacity: 1; }
          20% { transform: scale(1.1) rotate(-5deg); }
          40% { transform: scale(1.1) rotate(5deg); }
          60% { transform: scale(1.05) rotate(-3deg); }
          80% { transform: scale(1.1) rotate(2deg); opacity: 0.7; }
          100% { transform: scale(0.8) translateY(-20px); opacity: 0; }
        }
      `}</style>

      <div className="flex-shrink-0 flex justify-between items-center px-3 py-2 bg-red-900/80 border-b-2 border-red-700 relative z-10">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-bold text-yellow-300">{currentEra.name}</h1>
          <button onClick={() => setHelpModal(true)} className="w-5 h-5 rounded-full bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold">?</button>
        </div>
        <div className="flex gap-2 items-center text-xs">
          <div
            className={`px-2 py-1 rounded text-white transition-all ${sadChildren >= 3 ? 'bg-red-600' : 'bg-gray-600'}`}
            style={sadChildFlash ? {
              animation: sadChildFlash >= 2
                ? `sadPulseIntense ${0.6 + sadChildFlash * 0.2}s ease-in-out ${Math.min(sadChildFlash + 2, 6)}`
                : 'sadPulse 0.8s ease-in-out 4'
            } : {}}
          >
            😢 {sadChildren}/{MAX_SAD_CHILDREN}
          </div>
          <div className="bg-yellow-600 px-2 py-1 rounded text-white">⭐ {totalScore}</div>
        </div>
      </div>

      <div className="flex-shrink-0 flex justify-center gap-2 px-2 py-1 bg-amber-900/60 border-b border-amber-700 relative z-10 flex-wrap">
        <div className="bg-green-800 px-2 py-0.5 rounded text-white text-xs">🧝 {elves}</div>
        <span className="text-amber-600">|</span>
        {currentEra.resources.map(key => (
          <div key={key} className="flex items-center gap-1 text-white text-xs"
            style={recentResources.has(key) ? { animation: 'resourcePulse 0.3s ease-out' } : {}}>
            {RESOURCES[key]?.icon}<span className="font-bold">{resources[key] || 0}</span>
          </div>
        ))}
        {Object.keys(toyInventory).length > 0 && (
          <>
            <span className="text-amber-600">|</span>
            <span className="text-xs text-blue-300">📦</span>
            {Object.entries(toyInventory).filter(([, count]) => count > 0).map(([toyKey, count]) => (
              <div key={toyKey} className="flex items-center gap-0.5 text-white text-xs bg-blue-800/50 rounded px-1">
                {currentEra.toys[toyKey]?.icon}<span className="font-bold">{count}</span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Toy Chest - shows goal and built toys */}
      <div className="flex-shrink-0 flex items-center gap-2 px-2 py-1 bg-green-900/60 border-b border-green-700 relative z-10">
        <div className="bg-blue-700 px-2 py-0.5 rounded text-white text-xs font-bold">🎯 {ordersCompleted}/{currentEra.ordersToWin}</div>
        {Object.keys(builtToys).length > 0 && (
          <>
            <span className="text-green-500">|</span>
            <span className="text-xs text-green-300">🎁</span>
            <div className="flex gap-1 flex-wrap">
              {Object.entries(builtToys).map(([toyKey, count]) => (
                <div key={toyKey} className="flex items-center bg-green-800/50 rounded px-1.5 py-0.5 text-xs">
                  <span>{currentEra.toys[toyKey]?.icon}</span>
                  <span className="text-green-200 ml-0.5">×{count}</span>
                </div>
              ))}
            </div>
          </>
        )}
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
              (() => {
                // Calculate which orders can actually be afforded considering resource consumption order
                const availableResources = { ...resources };
                const affordableOrderIds = new Set();

                for (const order of orders) {
                  // Skip orders that are being crafted or have toys in inventory
                  const isCrafting = Object.values(workshopJobs).some(job => job && job.toyKey === order.toyKey);
                  const hasInInventory = (toyInventory[order.toyKey] || 0) > 0;
                  if (isCrafting || hasInInventory || order.status === 'expiring') continue;

                  // Check if we can afford this order with remaining resources
                  let canAfford = true;
                  for (const [res, amount] of Object.entries(order.toy.recipe)) {
                    if ((availableResources[res] || 0) < amount) {
                      canAfford = false;
                      break;
                    }
                  }

                  if (canAfford) {
                    affordableOrderIds.add(order.id);
                    // Deduct resources for this order
                    for (const [res, amount] of Object.entries(order.toy.recipe)) {
                      availableResources[res] = (availableResources[res] || 0) - amount;
                    }
                  }
                }

                return orders.map((order, index) => {
                  // Default to first order if none selected
                  const isExpanded = expandedOrder === order.id || (expandedOrder === null && index === 0);
                  const isCrafting = Object.values(workshopJobs).some(job => job && job.toyKey === order.toyKey);
                  const hasInInventory = (toyInventory[order.toyKey] || 0) >= (order.quantity - order.completed);
                  const canAfford = affordableOrderIds.has(order.id);
                  const isExpiring = order.status === 'expiring';
                  return (
                    <div key={order.id} onClick={() => !isExpiring && setExpandedOrder(order.id)}
                      className={`flex-shrink-0 rounded-lg p-2 border text-xs cursor-pointer transition-all ${isExpiring ? 'bg-red-600 border-red-400' : hasInInventory ? 'bg-blue-900/50 border-blue-500' : isCrafting ? 'bg-green-900/50 border-green-500' : canAfford ? 'bg-yellow-900/40 border-yellow-600' : 'bg-red-950/30 border-red-900/50 opacity-60'} ${isExpanded ? 'min-w-36' : 'min-w-20'}`}
                      style={isExpiring ? { animation: 'orderExpire 0.8s ease-out forwards' } : {}}>
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-white font-bold">{order.toy.icon} x{order.quantity}</span>
                        <span className={`font-mono text-xs ${order.timeLeft < 20 ? 'text-red-400' : 'text-green-400'}`}>{Math.round(order.timeLeft)}s</span>
                      </div>
                      <div className="text-amber-300 text-xs truncate">For {order.childName}</div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-gray-400">{order.completed}/{order.quantity}</span>
                        {(hasInInventory || isCrafting || !canAfford) && (
                          <span className={`px-1 rounded ${hasInInventory ? 'bg-blue-600 text-white' : isCrafting ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}>
                            {hasInInventory ? '📦' : isCrafting ? '🔨' : '⏳'}
                          </span>
                        )}
                      </div>
                      {isExpanded && (
                        <div className={`mt-2 pt-2 border-t ${isCrafting ? 'border-green-700/50' : 'border-red-700/50'}`}>
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
                });
              })()
            )}
          </div>
        </div>

        {/* Workshop Grid */}
        <div className="flex-1 flex items-center justify-center p-2 md:p-4 min-w-0">
          <div className="bg-amber-900/80 rounded-xl p-2 md:p-4 border-2 border-amber-700 w-full max-w-md relative">
            {/* Unassigned Elves */}
            {elves > 0 && (
              <div ref={idleAreaRef} className="flex justify-center gap-1 mb-2 pb-2 border-b border-amber-700/50">
                <span className="text-amber-300 text-xs mr-1">Idle:</span>
                {[...Array(elves)].map((_, i) => (
                  <span key={i} className="text-sm" style={{ animation: 'elfIdle 2s ease-in-out infinite', animationDelay: `${i * 0.2}s` }}>🧝</span>
                ))}
              </div>
            )}
            <div ref={gridRef} className="grid gap-1 w-full aspect-square relative" style={{ gridTemplateColumns: `repeat(${currentEra.gridSize}, 1fr)` }}>
              {/* Walking Elves Overlay */}
              {walkingElves.map(elf => (
                <div
                  key={elf.id}
                  className="absolute pointer-events-none z-20"
                  style={{
                    left: `${elf.fromLeft}px`,
                    top: `${elf.fromTop}px`,
                    transition: 'left 0.6s cubic-bezier(0.4, 0, 0.2, 1), top 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.1s ease-out',
                    opacity: 1,
                  }}
                  ref={(el) => {
                    if (el) {
                      // Force reflow to ensure initial position is painted before transition
                      el.getBoundingClientRect();
                      // Now set destination - transition will animate
                      el.style.left = `${elf.destLeft}px`;
                      el.style.top = `${elf.destTop}px`;
                      // Fade out at the end
                      setTimeout(() => {
                        el.style.opacity = '0';
                      }, 550);
                    }
                  }}
                >
                  <span
                    className="text-xs sm:text-sm block"
                    style={{ animation: 'elfWalk 0.25s ease-in-out infinite' }}
                  >
                    🧝
                  </span>
                </div>
              ))}
              {/* Floating Resource Emojis */}
              {floatingResources.map(floater => {
                const cell = cellRefs.current[floater.cellKey];
                const gridEl = gridRef.current;
                if (!cell || !gridEl) return null;
                const cellRect = cell.getBoundingClientRect();
                const gridRect = gridEl.getBoundingClientRect();
                const left = cellRect.left - gridRect.left + cellRect.width / 2;
                const top = cellRect.top - gridRect.top + cellRect.height / 2;
                return (
                  <div
                    key={floater.id}
                    className="absolute pointer-events-none z-30 text-lg"
                    style={{
                      left: `${left}px`,
                      top: `${top}px`,
                      transform: 'translate(-50%, -50%)',
                      animation: 'floatUp 1s ease-out forwards',
                    }}
                  >
                    {RESOURCES[floater.resourceKey]?.icon}
                  </div>
                );
              })}
              {/* Floating Toy Emojis */}
              {floatingToys.map(floater => {
                const cell = cellRefs.current[floater.cellKey];
                const gridEl = gridRef.current;
                if (!cell || !gridEl) return null;
                const cellRect = cell.getBoundingClientRect();
                const gridRect = gridEl.getBoundingClientRect();
                const left = cellRect.left - gridRect.left + cellRect.width / 2;
                const top = cellRect.top - gridRect.top + cellRect.height / 2;
                return (
                  <div
                    key={floater.id}
                    className="absolute pointer-events-none z-30 text-xl"
                    style={{
                      left: `${left}px`,
                      top: `${top}px`,
                      transform: 'translate(-50%, -50%)',
                      animation: 'floatUp 1s ease-out forwards',
                    }}
                  >
                    {floater.icon}
                  </div>
                );
              })}
              {/* Floating Musical Notes for Synced Stations */}
              {floatingNotes.map(note => {
                const cell = cellRefs.current[note.cellKey];
                const gridEl = gridRef.current;
                if (!cell || !gridEl) return null;
                const cellRect = cell.getBoundingClientRect();
                const gridRect = gridEl.getBoundingClientRect();
                // Random offset to make notes appear in different spots
                const offsetX = (Math.random() - 0.5) * cellRect.width * 0.6;
                const left = cellRect.left - gridRect.left + cellRect.width / 2 + offsetX;
                const top = cellRect.top - gridRect.top + cellRect.height / 2;
                return (
                  <div
                    key={note.id}
                    className="absolute pointer-events-none z-30 text-pink-300"
                    style={{
                      left: `${left}px`,
                      top: `${top}px`,
                      transform: 'translate(-50%, -50%)',
                      animation: 'floatUp 1.5s ease-out forwards',
                      textShadow: '0 0 4px rgba(236, 72, 153, 0.8)',
                    }}
                  >
                    {note.emoji}
                  </div>
                );
              })}
              {grid.slice(0, currentEra.gridSize).map((row, y) =>
                row.slice(0, currentEra.gridSize).map((cell, x) => {
                  const key = `${x}-${y}`;
                  const progress = stationProgress[key] || 0;
                  const elfCount = assignedElves[key] || 0;
                  const station = cell ? STATIONS[cell] : null;
                  const job = workshopJobs[key];
                  const isSelected = selectedTile && selectedTile.x === x && selectedTile.y === y;
                  const isDragSource = draggingElf?.sourceKey === key;
                  const isValidDropTarget = draggingElf && cell && key !== draggingElf.sourceKey && elfCount === 0;
                  const isSynced = syncedCells.has(key);
                  return (
                    <div key={key} ref={(el) => { if (el) cellRefs.current[key] = el; }}
                      onClick={() => handleCellClick(x, y)}
                      onTouchStart={(e) => elfCount > 0 && handleDragStart(x, y, e)}
                      onTouchMove={handleDragMove}
                      onTouchEnd={handleDragEnd}
                      className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden
                        ${cell ? `${station.color} ${isSelected ? 'border-white ring-2 ring-white' : isValidDropTarget ? 'border-green-400 ring-2 ring-green-400' : isSynced ? 'border-pink-400 ring-2 ring-pink-400/50' : 'border-amber-400 hover:border-yellow-300'}` : 'bg-amber-800/30 border-amber-700/50 hover:bg-amber-700/50 hover:border-amber-500'}
                        ${isDragSource ? 'opacity-50' : ''}`}
                      style={isSynced ? { boxShadow: '0 0 12px 2px rgba(236, 72, 153, 0.4)' } : undefined}>
                      {cell ? (
                        <>
                          {station.isWorkshop ? (
                            /* Workshop: show workbench with toy on top when crafting */
                            <div className="flex flex-col items-center justify-end w-full h-full pb-0.5">
                              {job ? (
                                <span className={iconSizes.toy} style={{ animation: 'elfWork 0.5s ease-in-out infinite' }}>
                                  {currentEra.toys[job.toyKey]?.icon}
                                </span>
                              ) : (
                                <span className={`${iconSizes.hammer} text-yellow-900/60`}>🔨</span>
                              )}
                              {/* Workbench - flat table with legs */}
                              <div className="w-5/6 mt-0.5">
                                {/* Tabletop */}
                                <div className="h-2 bg-amber-800 rounded-sm border border-amber-950" />
                                {/* Legs */}
                                <div className="flex justify-between">
                                  <div className="w-2 h-3 bg-amber-800 border-x border-amber-950" />
                                  <div className="w-2 h-3 bg-amber-800 border-x border-amber-950" />
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Resource station: show station icon */
                            <span className={iconSizes.station}>{station.icon}</span>
                          )}
                          {elfCount > 0 && !(isDragSource && elfCount === 1) && <span className={`absolute top-0.5 right-0.5 ${iconSizes.elf}`} style={{
                            animation: recentArrivals.has(key)
                              ? 'elfAppear 0.2s ease-out forwards'
                              : (station.isWorkshop && !job)
                                ? 'elfIdle 3s ease-in-out infinite'
                                : 'elfWork 0.375s ease-in-out infinite'
                          }}>🧝</span>}
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
                        <span className={`text-amber-700/50 ${iconSizes.plus}`}>+</span>
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

      {/* Dragging elf overlay */}
      {draggingElf && (
        <div
          ref={dragElfRef}
          className="fixed pointer-events-none z-50 text-3xl"
          style={{
            left: dragPositionRef.current.x,
            top: dragPositionRef.current.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <span style={{ animation: 'elfWalk 0.2s ease-in-out infinite' }}>🧝</span>
        </div>
      )}

      {stationModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setStationModal(null)}>
          <div className="bg-amber-900 border-4 border-yellow-500 rounded-xl p-4 shadow-2xl max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-yellow-300 mb-3 text-center">Choose a Station</h3>
            {/* Resource Stations */}
            <p className="text-amber-300 text-xs mb-1 font-bold">📦 Resource Stations</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {Object.entries(availableStations).filter(([_, s]) => !s.isWorkshop).map(([key, station]) => (
                <button key={key} onClick={() => placeStation(key)} className={`${station.color} p-2 rounded-lg border-2 border-transparent hover:border-yellow-300 transition-all flex items-center gap-2`}>
                  <span className="text-2xl">{station.icon}</span>
                  <div className="flex flex-col items-start">
                    <span className="text-white font-bold text-xs">{station.name}</span>
                    <span className="text-amber-200 text-xs">→ {RESOURCES[station.produces]?.icon} {RESOURCES[station.produces]?.name}</span>
                  </div>
                </button>
              ))}
            </div>
            {/* Workshop */}
            <p className="text-green-300 text-xs mb-1 font-bold">🔨 Crafting</p>
            <button onClick={() => placeStation('workshop')} className={`${STATIONS.workshop.color} p-2 rounded-lg border-2 border-transparent hover:border-yellow-300 transition-all flex items-center gap-2 w-full`}>
              <span className="text-2xl">{STATIONS.workshop.icon}</span>
              <div className="flex flex-col items-start">
                <span className="text-white font-bold text-xs">{STATIONS.workshop.name}</span>
                <span className="text-green-200 text-xs">Crafts toys from resources</span>
              </div>
            </button>
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
