# User Study Observations

## Session 1

### Observation 1: Unclear how to start
- It's not obvious what you're supposed to do to start
- Most users just tap randomly on the screen after the start screen
- They stumble upon tapping the grid to place stations by accident

**Potential fixes:**
- Add onboarding/tutorial hints
- Highlight the grid or show a pulsing "tap here" indicator
- Add an initial prompt or tooltip

### Observation 2: Elves not visually clear as characters
- It's not obvious that elves are occupying the stations
- The small elf icon in the corner of a station doesn't convey "a character is here"

**Potential fixes:**
- Show unassigned elves as distinct individuals standing above the grid
- Animate elves literally walking to stations when assigned
- Make it clear they are characters moving around, not teleporting
- Consider walk animations between positions to reinforce the concept

### Observation 3: Working elves look idle
- When elves are working a station, it's not clear enough that they're actively doing something
- The static elf icon doesn't convey "busy" vs "idle"

**Potential fixes:**
- Add a working animation to elves at stations (bobbing, hammering motion, etc.)
- Different animation states for idle vs working
- Maybe show sweat drops, motion lines, or tool-swinging animation

### Observation 4: Elf reassignment not discoverable
- It's not obvious that elves can be reassigned to other stations
- Users don't realize they can move elves around

**Potential fixes:**
- Tutorial hint showing drag/tap to reassign
- Visual affordance when station is selected (show possible destinations)
- "Move elf" button or drag handle on assigned elves
- Highlight empty stations when an elf is selected

### Observation 5: Mobile users expect drag-and-drop
- Users on mobile attempted to drag elves to move them
- Current tap-to-select, tap-to-assign is not intuitive on touch devices

**Potential fixes:**
- Implement actual drag-and-drop for elves
- Touch and hold to pick up elf, drag to destination
- Visual feedback during drag (elf follows finger)
- Drop zones highlight when dragging
