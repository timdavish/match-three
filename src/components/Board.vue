<template>
  <div class="board-container">
    <button class="ai-button"
      @click="setAIStatus">
      {{ ai ? 'Disable' : 'Enable' }} AI
    </button>

    <div :class="[`board-${rows}-${cols}`, `border-${status}`]">
      <div class="grid-container">
        <div class="grid-position"
          v-for="position in positions" :key="position.id">
        </div>
      </div>
      <transition-group name="tile" tag="div" class="tile-container">
        <tile
          v-for="tile in tiles" :key="tile.id"
          :tile="tile"
          :selection="selection"
          :suggestion="suggestion"
          @touch="tileTouch">
        </tile>
      </transition-group>
    </div>
  </div>
</template>

<script>
/* eslint-disable */

import Tile from './Tile';
import PermutationException from '../exceptions/PermutationException';
import { BLOCKERS, DIRECTIONS, POINTS, PRIORITIES, SPECIALS, STATUS, TIMES, VECTORS } from '../shared/constants';
import { getLines } from '../shared/lines';
import { deepCopy, equalOnProps, generateUid, isBlank, random, wait, waitInPromise } from '../shared/util';

export default {
  name: 'Board',
  components: { Tile },
  props: {
    boardData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      ai: false,
      status: STATUS.BUSY,
      positions: [],
      tiles: [],
      matches: [],
      moves: [],
      lastSwap: {},
      selection: {},
      suggestion: {},
      suggestionTimer: null,
    };
  },
  computed: {
    // Board data getters
    rows() { return this.boardData.rows; },
    cols() { return this.boardData.cols; },
    tileTypes() { return this.boardData.tileTypes; },
  },
  methods: {
    // Starts a new game
    newGame() {
      const { positions, tiles } = this.boardData;

      // Set the board's positions
      this.positions = positions;

      // Set the board's tiles
      this.tiles = this.getStartingTiles(tiles);

      // Set other properties
      this.matches = [];
      this.moves = [];
      this.clearLastSwap();
      this.clearSelection();
      this.clearSuggestion();

      // Run our game loop before allowing user interaction
      this.gameLoop();
    },

    // Initializes new starting tiles
    getStartingTiles(startTiles) {
      // Reset tiles
      const tiles = startTiles;

      for (let row = 0; row < this.rows; row += 1) {
        for (let col = 0; col < this.cols; col += 1) {
          if (!tiles.some(t => t.row === row && t.col === col)) {
            const position = this.getPosition(row, col);

            // Make sure the position can contain a tile
            if (this.isActivePosition(position)) {
              tiles.push({
                id: generateUid(),
                row, col,
                type: this.getRandomTileType(),
                special: SPECIALS.NONE,
                shifts: [],
                removed: false
              });
            }
          }
        }
      }

      return tiles;
    },

    // The main game loop
    async gameLoop() {
      // Wrap the game loop in order to catch game ending errors
      try {
        this.setGameStatus(STATUS.BUSY);

        await this.resolveLoop();
        await this.insuranceLoop();

        this.setGameStatus(STATUS.IDLE);

        await this.ai ? this.aiMove() : this.giveSuggestion();
      } catch(err) {
        console.log(err);
      }
    },

    // Resolves everything on the board
    async resolveLoop() {
      const hadMatches = await this.handleMatches();
      const hadShifts = await this.handleShifts();
      const hadExplodeds = await this.handleExplodeds();

      // Repeat if we need to
      if (hadMatches || hadShifts || hadExplodeds) {
        await this.resolveLoop();
      }
    },

    // Ensures that the user has an available move
    async insuranceLoop() {
      this.findMoves();

      if (this.moves.length <= 0) {
        if (!this.matchPossible()) {
          throw new PermutationException();
        } else {
          await this.shuffleTiles();
        }
      }
    },

    // Handles matches
    async handleMatches() {
      this.findMatches();

      const matches = this.matches.slice();
      this.matches = [];

      await this.removeMatches(matches);

      return matches.length;
    },

    // Handles shifting
    async handleShifts() {
      return (
        await this.setShifts() &&
        await this.shiftTiles()
      );
    },

    // Handles special exploded wrappeds
    async handleExplodeds() {
      const explodeds = this.tiles.filter(t => t.special === SPECIALS.WRAPPED_EXPLODED);
      await this.hitPositions(explodeds, true);

      return explodeds.length;
    },

    // Remove any matches
    async removeMatches(matches) {
      const newSpecials = [];

      for (let match of matches) {
        if (this.validMatch(match)) {
          await this.hitPositions(match.positions);

          // Save newly created specials and add bonus points
          if (match.special !== SPECIALS.NONE) {
            newSpecials.push(match);
            this.addScore(match.bonusPoints);
          }
        }
      }

      if (matches.length) {
        // Wait for animation
        await wait(TIMES.ANIMATIONS.REMOVE);
        await this.setSpecials(newSpecials);
      }
    },

    // Set any special tiles that were created
    async setSpecials(newSpecials) {
      const getOpenPosition = positions => {
        return positions.find(p => {
          const t = this.getTile(p.row, p.col);
          return t.special === SPECIALS.NONE;
        });
      };

      const { active, row1, col1, row2, col2 } = this.lastSwap;
      this.clearLastSwap();

      for (let newSpecial of newSpecials) {
        const { positions, special } = newSpecial;

        const swapPosition = positions.find(p => {
          const t = this.getTile(p.row, p.col);
          return (
            t.special === SPECIALS.NONE && ((p.row === row1 && p.col === col1) || (p.row === row2 && p.col === col2))
          );
        });
        const position = swapPosition || getOpenPosition(positions);
        const tile = this.getTile(position.row, position.col);

        tile.removed = false;
        tile.special = special;

        // Bombs are the only type that don't have a type
        if (special === SPECIALS.BOMB) {
          tile.type = this.tileTypes.length;
        }
      }

      if (newSpecials.length) {
        // Wait for animation
        await wait(TIMES.ANIMATIONS.SET_SPECIAL);
      }
    },

    // Sets all tile's shifts
    async setShifts() {
      // Filter positions for column start positions that aren't blocked
      const columnStarts = this.positions.filter((p) => p.columnStart && p.blocker === BLOCKERS.NONE);

      let haveShifts = false;

      // Set shifts for each tile in each column
      columnStarts.forEach((startPosition) => {
        const shifts = [];
        const newTiles = [];

        // Set non-new tile shifts
        this.reverseIterateColumn(startPosition, (curPosition) => {
          const { row, col, feedDirection } = curPosition;

          const tile = this.getTile(row, col);
          const newShift = this.getOppositeDirection(feedDirection);

          if (tile && tile.removed) {
            haveShifts = true;

            // Add new shift
            shifts.unshift(newShift);

            // Add tile to newTiles for later processing
            newTiles.push(tile);

          } else if (shifts.length > 0) {
            // Set tile shifts
            tile.shifts = deepCopy(shifts);

            // Cycle shifts
            shifts.unshift(newShift);
            shifts.pop();
          }
        });

        // Set new tile shifts and starting positions
        const columnStartFlowDirection = startPosition.flowDirection;
        const columnStartFeedDirection = this.getOppositeDirection(columnStartFlowDirection);
        let { row, col } = startPosition;
        newTiles.map((tile) => {
          // Set tile shifts
          tile.shifts = deepCopy(shifts);

          // Cycle shifts
          shifts.unshift(columnStartFlowDirection);
          shifts.pop();

          // Cycle positions
          // For each new tile, move (row, col) one step 'above' the column start
          // flow direction, so that each consecutive new tile gets placed above
          // the previous one.
          ({ row, col } = this.getCoordinatesInDirection(row, col, columnStartFeedDirection));

          // Set new tile starting location
          tile.row = row;
          tile.col = col;

          // Set new tile type
          tile.type = this.getRandomTileType();
        });
      });

      if (haveShifts) {
        // Wait for animation
        await wait(TIMES.ANIMATIONS.CREATE);
      }

      return haveShifts;
    },

    // Shifts all shiftable tiles
    async shiftTiles() {
      const shiftableTiles = this.tiles.filter(tile => tile.shifts.length);

      // Base case
      if (!shiftableTiles.length) {
        return true;
      } else {
        for (let tile of shiftableTiles) {
          const direction = tile.shifts.shift();

          let { row, col } = this.getCoordinatesInDirection(tile.row, tile.col, direction);

          tile.row = row;
          tile.col = col;

          if (tile.removed && this.withinBoard(row, col)) {
            tile.removed = false;
          }
        }

        // Wait for animation
        await wait(TIMES.ANIMATIONS.SHIFT);
        return await this.shiftTiles();
      }
    },

    // Shuffles all available tiles
    async shuffleTiles() {
      const tiles = this.tiles;
      const last = tiles.length - 1;

      while (this.moves.length <= 0 || this.matches.length > 0) {
        for (let index = 0; index <= last; index += 1) {
          const rand = random(index, last);
          const { row: row1, col: col1 } = tiles[index];
          const { row: row2, col: col2 } = tiles[rand];
          this.swapTiles(row1, col1, row2, col2);
        }

        this.findMoves();
        this.findMatches();
      }

      // Wait for animation
      await wait(TIMES.ANIMATIONS.SHUFFLE);
    },

    // Hit positions
    async hitPositions(positions, explodeds = false) {
      const removedSpecials = [];
      for (let position of positions) {
        // Allow for tiles to be passed in
        if (!position.blocker) {
          position = this.getPosition(position.row, position.col);
        }

        if (this.hasBlocker(position)) {
          this.hitBlocker(position);
        } else {
          // Make sure there is a tile to hit
          const tile = this.getTile(position.row, position.col);

          if (tile && tile.special && (explodeds || tile.special !== SPECIALS.WRAPPED_EXPLODED)) {
            const tileCopy = deepCopy(tile);
            const special = tile.special;

            if (!tile.removed) {
              this.removeTile(tile);
            }

            if (special === SPECIALS.WRAPPED) {
              tile.removed = false;
              tile.special = SPECIALS.WRAPPED_EXPLODED;
            }

            if (special !== SPECIALS.NONE) {
              removedSpecials.push(tileCopy);
            }
          }
        }
      }

      await this.removeSpecials(removedSpecials);
    },

    // Remove any special tiles
    async removeSpecials(specials) {
      for (let s of specials) {
        const { row, col, special } = s;

        switch (special) {
          case SPECIALS.PAINTER:
            await this.handleSpecialPainter(row, col);
            break;
          case SPECIALS.BOMB:
            await this.handleSpecialBomb(row, col);
            break;
          case SPECIALS.WRAPPED:
          case SPECIALS.WRAPPED_EXPLODED:
            await this.handleSpecialWrapped(row, col);
            break;
          case SPECIALS.STRIPED_H:
            const hDirections = [DIRECTIONS.LEFT, DIRECTIONS.RIGHT];
            await this.handleSpecialStriped(row, col, hDirections);
            break;
          case SPECIALS.STRIPED_V:
            const vDirections = [DIRECTIONS.UP, DIRECTIONS.DOWN];
            await this.handleSpecialStriped(row, col, vDirections);
            break;
          case SPECIALS.FISH:
            await this.handleSpecialFish(row, col);
            break;
        }
      }
    },

    // Handle special painter tiles
    async handleSpecialPainter(row, col, options = {}) {
      const { special, types } = options;

      const painter = this.getTile(row, col);
      const type = painter.type;
      const typesToPaint = types || [painter.type, this.getRandomTileType(painter.type)];
      const tilesToPaint = this.tiles.filter(tile => typesToPaint.some(t => t === tile.type));

      // Promise.all makes sure we wait for all the animations to finish
      await Promise.all(tilesToPaint.map(tile => {
        const paintTime = random(TIMES.ANIMATIONS.PAINTER_MINIMUM, TIMES.ANIMATIONS.PAINTER_MAXIMUM);

        return new Promise(resolve => {
          setTimeout(() => resolve(this.setTileAs(tile, { special, type })), paintTime);
        });
      }));

      this.removeTile(painter);

      if (special !== SPECIALS.NONE) {
        await this.hitPositions(tilesToPaint);
      }
    },

    // Handle special bomb tiles
    async handleSpecialBomb(row, col, options = {}) {
      const { special, type } = options;

      const bomb = this.getTile(row, col);
      const typeToBomb = isBlank(type) ? this.getRandomTileType() : type;
      const tilesToBomb = this.tiles.filter(tile => tile.type === typeToBomb);

      // Promise.all makes sure we wait for all the animations to finish
      await Promise.all(tilesToBomb.map(tile => {
        const bombTime = random(TIMES.ANIMATIONS.BOMB_MINIMUM, TIMES.ANIMATIONS.BOMB_MAXIMUM);

        if (special !== SPECIALS.NONE && tile.special === SPECIALS.NONE) {
          this.setTileAs(tile, { special });
        }

        return new Promise(resolve => {
          setTimeout(() => resolve(this.hitPositions([tile])), bombTime);
        });
      }));

      this.removeTile(bomb);
    },

    // Handle special wrapped tiles
    async handleSpecialWrapped(row, col, exploded = false) {
      const neighbors = this.getValidNeighbors(row, col, true);

      this.hitPositions(neighbors);

      // Wait for animation
      await wait(TIMES.ANIMATIONS.WRAPPED);
    },

    // Handle special striped tiles
    async handleSpecialStriped(row, col, directions) {
      // Get and filter positions in directions that we need to hit next
      const filteredCoords = directions.map(direction => {
        const coords = this.getCoordinatesInDirection(row, col, direction);
        return { ...coords, direction };
      }).filter(c => this.withinBoard(c.row, c.col));

      const position = this.getPosition(row, col);
      this.hitPositions([position]);

      // Promise.all makes sure we wait for all the animations to finish
      await Promise.all(filteredCoords.map(coords => {
        const { row: nextRow, col: nextCol, direction } = coords;

        return new Promise(resolve => {
          setTimeout(() => resolve(
            this.handleSpecialStriped(nextRow, nextCol, [direction])
          ), TIMES.ANIMATIONS.STRIPED);
        });
      }));
    },

    // Handle special fish tiles
    handleSpecialFish(row1, col1, row2, col2, targetCount = 1) {
      const fishLocs = [
        { row: row1, col: col1 },
        { row: row2, col: col2 },
      ];

      let positions = [];

      for (let fishNum = 1; fishNum <= targetCount; fishNum += 1) {
        let randRow;
        let randCol;
        let position;

        // Make sure we choose a different random position
        do {
          randRow = random(this.rows - 1);
          randCol = random(this.cols - 1);
          position = this.getPosition(randRow, randCol);
        } while (
          fishLocs.some(l => l.row === randRow && l.col == randCol) ||
          positions.some(p => p === position) ||
          !position.active
        )

        positions.push(position);
      }

      setTimeout(() => this.hitPositions(positions), TIMES.ANIMATIONS.FISH);
    },

    // Finds all current available matches
    findMatches() {
      // Reset matches
      let matches = [];

      // Calculate best match for each board position
      this.positions.forEach((p) => {
        const { row, col } = p;

        const match = this.calculateBestMatch(row, col);
        if (match !== null) {
          matches.push(match);
        }
      });

      // Sort matches by priority ascending, length descending
      // This allows us to remove the ones that we consider 'better', first
      this.matches = matches.sort((a, b) => {
        // Ascending priority sort
        const priorityDiff = a.priority - b.priority;
        // Descending length sort
        const lengthDiff = b.positions.length - a.positions.length;

        return priorityDiff === 0
          ? lengthDiff
          : priorityDiff;
      });
    },

    // Finds all current available moves
    findMoves() {
      // Reset moves
      let moves = [];

      // Find horizontal moves
      for (let row = 0; row < this.rows; row += 1) {
        for (let col = 0; col < this.cols - 1; col += 1) {
          const p1 = this.getPosition(row, col);
          const p2 = this.getPosition(row, col + 1);

          if (this.isActivePosition(p1) && this.isActivePosition(p2)) {
            const tile1 = this.getTile(row, col);
            const tile2 = this.getTile(row, col + 1);

            // Check for special swaps
            if ((this.hasBigSpecial(tile1) || this.hasBigSpecial(tile1)) || (this.hasSpecial(tile1) && this.hasSpecial(tile2))) {
              // Big specials can always be swapped with any other tile
              // Specials can be swapped with any other special
              const priorities = [
                PRIORITIES[tile1.special],
                PRIORITIES[tile2.special],
              ];

              moves.push({row1: row, col1: col, row2: row, col2: col + 1, priorities });
            } else {
              // Swap, find matches, swap back
              this.swapTiles(row, col, row, col + 1, false);
              this.findMatches();
              this.swapTiles(row, col, row, col + 1, false);
              // Check if the swap made a match
              if (this.matches.length > 0) {
                // Found at least one valid move
                const priorities = this.matches.map(m => m.priority);
                moves.push({ row1: row, col1: col, row2: row, col2: col + 1, priorities });
              }
            }
          }
        }
      }

      // Find vertical moves
      for (let col = 0; col < this.cols; col += 1) {
        for (let row = 0; row < this.rows - 1; row += 1) {
          const p1 = this.getPosition(row, col);
          const p2 = this.getPosition(row + 1, col);

          if (this.isActivePosition(p1) && this.isActivePosition(p2)) {
            const tile1 = this.getTile(row, col);
            const tile2 = this.getTile(row + 1, col);

            // Check for special swaps
            if ((this.hasBigSpecial(tile1) || this.hasBigSpecial(tile1)) || (this.hasSpecial(tile1) && this.hasSpecial(tile2))) {
              // Big specials can always be swapped with any other tile
              // Specials can be swapped with any other special
              const priorities = [
                PRIORITIES[tile1.special],
                PRIORITIES[tile2.special],
              ];

              moves.push({row1: row, col1: col, row2: row + 1, col2: col, priorities });
            } else {
              // Swap, find matches, swap back
              this.swapTiles(row, col, row + 1, col, false);
              this.findMatches();
              this.swapTiles(row, col, row + 1, col, false);
              // Check if the swap made a match
              if (this.matches.length > 0) {
                // Found at least one valid move
                const priorities = this.matches.map(m => m.priority);
                moves.push({ row1: row, col1: col, row2: row + 1, col2: col, priorities });
              }
            }
          }
        }
      }

      // Sort moves by priorities
      moves = moves.sort((a, b) => {
        const { priorities: prioritiesA } = a;
        const { priorities: prioritiesB } = b;

        const length = Math.max(prioritiesA.length, prioritiesB.length);

        for (let i = 0; i < length; i += 1) {
          let priA = prioritiesA[i];
          let priB = prioritiesB[i];

          if (isBlank(priA)) {
            priA = Infinity;
          }
          if (isBlank(priB)) {
            priB = Infinity;
          }

          const comparision = priA - priB;

          if (comparision !== 0) {
            return comparision;
          }
        }

        // Priorities were equal
        return 0;
      });

      // Reset matches
      this.matches = [];
      this.moves = moves;

      // Return promise for chaining
      return Promise.resolve();
    },

    // Makes an ai move
    async aiMove() {
      // Clear selection and suggestion
      this.clearSelection();
      this.clearSuggestion();

      // 'Think' for a random amount of time
      const thinkTime = random(TIMES.WAITS.THINK_MINIMUM, TIMES.WAITS.THINK_MAXIMUM);
      await wait(thinkTime);

      // Make sure ai is still enabled, then attempt swap
      if (this.ai) {
        const { row1, col1, row2, col2 } = this.moves[0];

        return this.attemptSwap(row1, col1, row2, col2);
      }
    },

    // Handles a board touch
    tileTouch(tile) {
      // Only allow tile touches while game is idle
      if (this.status === STATUS.IDLE) {
        const { selected, row, col } = this.selection;
        const { row: newRow, col: newCol } = tile;

        // Clear selection and suggestion
        this.clearSelection();
        this.clearSuggestion();

        let giveAnotherSuggestion = true;

        // Check if the position is selectable
        if (!selected || row !== newRow || col !== newCol) {
          // Check if the position is an edge neighbor
          if (this.validNeighbor(row, col, newRow, newCol)) {
            // Don't give another suggestion
            giveAnotherSuggestion = false;

            // Attempt to swap the tiles
            this.attemptSwap(row, col, newRow, newCol);
          } else {
            // Refresh our selected position
            const newNeighbors = this.getValidNeighbors(newRow, newCol);

            this.selection = { selected: true, row: newRow, col: newCol, neighbors: newNeighbors };
          }
        }

        // See if we're supposed to give another suggestion
        if (giveAnotherSuggestion) {
          this.giveSuggestion();
        }
      }
    },

    // Attempt a tile swap
    async attemptSwap(row1, col1, row2, col2) {
      this.setGameStatus(STATUS.BUSY);
      this.lastSwap = { active: true, row1, col1, row2, col2 };

      await this.swapTiles(row1, col1, row2, col2);

      // Check if this is a valid move
      if (!this.validMove(row1, col1, row2, col2)) {
        // Swap back
        await this.swapTiles(row1, col1, row2, col2);
        this.setGameStatus(STATUS.IDLE);
      } else {
        this.addMoves(-1);

        const tile1 = this.getTile(row1, col1);
        const tile2 = this.getTile(row2, col2);
        const special1 = tile1.special;
        const special2 = tile2.special;

        // Check for special kinds of swaps
        if (this.isPainterBombSwap(special1, special2)) {
          await this.handlePainterBombSwap(tile1, tile2);

        } else if (this.isPainterPainterSwap(special1, special2)) {
          await this.handlePainterPainterSwap(tile1, tile2,);

        } else if (this.isPainterOtherSwap(special1, special2)) {
          await this.handlePainterOtherSwap(tile1, tile2);

        } else if (this.isPainterNoneSwap(special1, special2)) {
          await this.handlePainterNoneSwap(tile1, tile2);

        } else if (this.isBombBombSwap(special1, special2)) {
          await this.handleBombBombSwap(tile1, tile2);

        } else if (this.isBombOtherSwap(special1, special2)) {
          await this.handleBombOtherSwap(tile1, tile2);

        } else if (this.isBombNoneSwap(special1, special2)) {
          await this.handleBombNoneSwap(tile1, tile2);

        } else if (this.isOtherOtherSwap(special1, special2)) {
          await this.handleOtherOtherSwap(tile1, tile2);
        }

        // Finally, run the game loop
        this.gameLoop();
      }
    },

    // Swaps two tiles
    async swapTiles(row1, col1, row2, col2, animated = true) {
      const tile1 = this.getTile(row1, col1);
      const tile2 = this.getTile(row2, col2);

      this.setTileAt(tile1, row2, col2);
      this.setTileAt(tile2, row1, col1);

      await wait(animated ? TIMES.ANIMATIONS.SWAP : 0);
    },

    // Add to the level moves
    addMoves(moves = -1) {
      this.$emit('addMoves', moves);
    },

    // Add points to the level score
    addScore(points) {
      // Add the points
      this.$emit('addScore', points);
    },

    // Clears the last tile selection
    clearLastSwap() {
      this.lastSwap = { active: false, row1: null, col1: null, row2: null, col2: null };
    },

    // Clears the tile selection
    clearSelection() {
      this.selection = { selected: false, row: null, col: null, neighbors: [] };
    },

    // Clears the move suggestion
    clearSuggestion() {
      clearTimeout(this.suggestionTimer);
      this.suggestion = { suggested: false, row1: null, col1: null, row2: null, col2: null };
    },

    // Starts a move suggestion
    giveSuggestion() {
      this.suggestionTimer = setTimeout(() => {
        const { row1, col1, row2, col2 } = this.moves[0];
        this.suggestion = { suggested: true, row1, col1, row2, col2 };
      }, TIMES.WAITS.SUGGESTION);
    },

    // Sets the game status
    setGameStatus(status) {
      this.status = status;
    },

    // Sets the ai status
    setAIStatus() {
      this.ai = !this.ai;

      // We don't need to do anything if the board is busy
      if (this.status === STATUS.IDLE) {
        this.ai ? this.aiMove() : this.giveSuggestion();
      }
    },

    //
    isPainterBombSwap(special1, special2) {
      return (
        (special1 === SPECIALS.PAINTER && special2 === SPECIALS.BOMB) ||
        (special2 === SPECIALS.PAINTER && special1 === SPECIALS.BOMB)
      );
    },

    //
    async handlePainterBombSwap(tile1, tile2) {
      // Hit every position 3 times
      const times = 3;
      const targets = this.positions;

      this.removeTile(tile1);
      this.removeTile(tile2);

      for (let time = 1; time <= times; time += 1) {
        this.hitPositions(targets);
      }

      await wait(TIMES.ANIMATIONS.PAINTER_BOMB);
    },

    //
    isPainterPainterSwap(special1, special2) {
      return special1 === SPECIALS.PAINTER && special2 === SPECIALS.PAINTER;
    },

    //
    async handlePainterPainterSwap(tile1, tile2) {
      const { row: r1, col: c1, special: s1, type: t1 } = tile1;
      const { row: r2, col: c2, special: s2, type: t2 } = tile2;

      const painterRow = s1 === SPECIALS.PAINTER ? r1 : r2;
      const painterCol = s1 === SPECIALS.PAINTER ? c1 : c2;
      const types = this.tileTypes;

      const options = { types };

      await this.handleSpecialPainter(painterRow, painterCol, options);
    },

    //
    isPainterOtherSwap(special1, special2) {
      return (
        (special1 === SPECIALS.PAINTER && special2 !== SPECIALS.NONE) ||
        (special2 === SPECIALS.PAINTER && special1 !== SPECIALS.NONE)
      );
    },

    //
    async handlePainterOtherSwap(tile1, tile2) {
      const { row: r1, col: c1, special: s1, type: t1 } = tile1;
      const { row: r2, col: c2, special: s2, type: t2 } = tile2;

      const painterRow = s1 === SPECIALS.PAINTER ? r1 : r2;
      const painterCol = s1 === SPECIALS.PAINTER ? c1 : c2;
      const special = s1 === SPECIALS.PAINTER ? s2 : s1;
      const types = [t1, t2];

      const options = { special, types };

      await this.handleSpecialPainter(painterRow, painterCol, options);
    },

    //
    isPainterNoneSwap(special1, special2) {
      return special1 === SPECIALS.PAINTER || special2 === SPECIALS.PAINTER;
    },

    //
    async handlePainterNoneSwap(tile1, tile2) {
      const { row: r1, col: c1, special: s1, type: t1 } = tile1;
      const { row: r2, col: c2, special: s2, type: t2 } = tile2;

      const painterRow = s1 === SPECIALS.PAINTER ? r1 : r2;
      const painterCol = s1 === SPECIALS.PAINTER ? c1 : c2;
      const special = s1 === SPECIALS.PAINTER ? s2 : s1;
      const types = [t1, t2];

      const options = { special, types };

      await this.handleSpecialPainter(painterRow, painterCol, options);
    },

    //
    isBombBombSwap(special1, special2) {
      return special1 === SPECIALS.BOMB && special2 === SPECIALS.BOMB;
    },

    //
    async handleBombBombSwap(tile1, tile2) {
      // Hit every position once
      const targets = this.positions;

      this.removeTile(tile1);
      this.removeTile(tile2);

      this.hitPositions(targets);

      await wait(TIMES.ANIMATIONS.BOMB_BOMB);
    },

    //
    isBombOtherSwap(special1, special2) {
      return (
        (special1 === SPECIALS.BOMB && special2 !== SPECIALS.NONE) ||
        (special2 === SPECIALS.BOMB && special1 !== SPECIALS.NONE)
      );
    },

    //
    async handleBombOtherSwap(tile1, tile2) {
      const { row: r1, col: c1, special: s1, type: t1 } = tile1;
      const { row: r2, col: c2, special: s2, type: t2 } = tile2;

      const bombRow = s1 === SPECIALS.BOMB ? r1 : r2;
      const bombCol = s1 === SPECIALS.BOMB ? c1 : c2;
      const special = s1 === SPECIALS.BOMB ? s2 : s1;
      const type = s1 === SPECIALS.BOMB ? t2 : t1;

      const options = { special, type };

      await this.handleSpecialBomb(bombRow, bombCol, options);
    },

    //
    isBombNoneSwap(special1, special2) {
      return special1 === SPECIALS.BOMB || special2 === SPECIALS.BOMB;
    },

    //
    async handleBombNoneSwap(tile1, tile2) {
      const { row: r1, col: c1, special: s1, type: t1 } = tile1;
      const { row: r2, col: c2, special: s2, type: t2 } = tile2;

      const bombRow = s1 === SPECIALS.BOMB ? r1 : r2;
      const bombCol = s1 === SPECIALS.BOMB ? c1 : c2;
      const special = s1 === SPECIALS.BOMB ? s2 : s1;
      const type = s1 === SPECIALS.BOMB ? t2 : t1;

      const options = { special, type };

      await this.handleSpecialBomb(bombRow, bombCol, options);
    },

    //
    isOtherOtherSwap(special1, special2) {
      return special1 !== SPECIALS.NONE && special2 !== SPECIALS.NONE;
    },

    //
    async handleOtherOtherSwap(tile1, tile2) {
      console.log(tile1.special, 'swapped with', tile2.special);

      const { row: r1, col: c1, special: s1, type: t1 } = tile1;
      const { row: r2, col: c2, special: s2, type: t2 } = tile2;

      if (s1 === SPECIALS.WRAPPED || s2 === SPECIALS.WRAPPED) {
        // Wrapped w/ fish

        // Wrapped w/ striped

        // Wrapped w/ wrapped
      } else if (s1 === SPECIALS.STRIPED_H || s1 === SPECIALS.STRIPED_V || s2 === SPECIALS.STRIPED_H || s2 === SPECIALS.STRIPED_V) {
        // Striped w/ fish

        // Striped w/ striped
      } else {
        // Fish w/ fish
        this.handleSpecialFish(r1, c1, r2, c2, 3);
        this.removeTile(tile1);
        this.removeTile(tile2);
      }
    },

    /**
     * Helper Functions
     */

    getTile(row, col) {
      return this.tiles.find((t) => t.row === row && t.col === col);
    },

    getPosition(row, col) {
      return this.positions.find((p) => p.row === row && p.col === col);
    },

    getRandomTileType(not = null) {
      let randomType;

      while (isBlank(randomType) || !isBlank(not) && randomType === not) {
        randomType = random(this.tileTypes.length - 1);
      }

      return randomType;
    },

    setTileAs(tile, props = {}) {
      return new Promise(resolve => {
        for (let prop in props) {
          if (!isBlank(props[prop])) {
            tile[prop] = props[prop];
          }
        }
        resolve();
      });
    },

    setTileAt(tile, row, col) {
      tile.row = row;
      tile.col = col;
    },

    removeTile(tile) {
      tile.removed = true;
      tile.special = SPECIALS.NONE;

      this.addScore(POINTS.TILE);
    },

    isActivePosition(position) {
      return position.active && !this.hasBlocker(position);
    },

    hasBlocker(position) {
      return position.blocker !== BLOCKERS.NONE;
    },

    hasSpecial(tile) {
      return tile.special !== SPECIALS.NONE;
    },

    hasBigSpecial(tile) {
      return tile.special === SPECIALS.PAINTER || tile.special === SPECIALS.BOMB;
    },

    hitBlocker(position) {
      const blocker = position.blocker;
      const base = blocker.slice(0, -1);
      const layer = parseInt(blocker.slice(-1));

      position.blocker = !isNaN(layer) && layer > 1
        ? BLOCKERS[`${base}${layer}`]
        : BLOCKERS.NONE;
    },

    coordinatesToIndex(pos) {
      return (pos.row * this.cols) + pos.col;
    },

    reverseIterateColumn(position, func) {
      // Recurse until this column stops
      if (position.flowDirection !== DIRECTIONS.NONE) {
        // The column isn't supposed to stop here, so check next position
        // to see if it's blocked
        const nextPosition = this.getNextPositionFromFlow(position);
        if (nextPosition.blocker === BLOCKERS.NONE) {
          // We're good to recurse
          this.reverseIterateColumn(nextPosition, func);
        }
      }

      // Then do something with this position
      func(position);
    },

    calculateBestMatch(row, col) {
      let match = null;

      // Lines are sorted by priority, so that the best match is found first
      // This allows us to short circuit the search below
      const lines = this.getValidLines(row, col);

      if (lines.length > 0) {
        const type = this.getTile(row, col).type;

        // Loop through the lines
        lines.some((line) => {
          // We have a match if for every index in the line the tile type is the same
          const hasMatch = line.positions.every((p) => this.getTile(p.row, p.col).type === type);

          if (hasMatch) {
            match = line;
          }

          // Return a match as soon as we find one
          return hasMatch;
        });
      }

      return match;
    },

    getValidLines(row, col) {
      const lines = getLines(row, col);

      // Filter out lines that don't fit
      return lines.filter((line) => line.positions.every((p) => {
        const position = this.getPosition(p.row, p.col);

        return (
          this.withinBoard(p.row, p.col) &&
          this.isActivePosition(position)
        );
      }));
    },

    getNextPositionFromFlow(position) {
      const { row, col, flowDirection } = position;
      const { row: nextRow, col: nextCol } = this.getCoordinatesInDirection(row, col, flowDirection);

      return this.getPosition(nextRow, nextCol);
    },

    /**
     * Gets the coordinates in the given direction, from the given position
     * @param {Number} row The row of the position
     * @param {Number} col The column of the position
     * @param {Direction} direction The direction
     * @return {Object} The coordinates in the given direction
     */
    getCoordinatesInDirection(row, col, direction) {
      const vector = VECTORS[direction];
      return {
        row: row + vector.row,
        col: col + vector.col,
      };
    },

    /**
     * Gets the valid neighbors around the given position
     * @param {Number} row The row of the position
     * @param {Number} col The column of the position
     * @param {Boolean} all (Optional) Whether to get corner neighbors or not
     * @return {Array} Array of valid neighbors
     */
    getValidNeighbors(row, col, all = false) {
      const edges = [
        this.getCoordinatesInDirection(row, col, DIRECTIONS.UP),
        this.getCoordinatesInDirection(row, col, DIRECTIONS.RIGHT),
        this.getCoordinatesInDirection(row, col, DIRECTIONS.DOWN),
        this.getCoordinatesInDirection(row, col, DIRECTIONS.LEFT),
      ];

      const corners = [
        this.getCoordinatesInDirection(row, col, DIRECTIONS.UP_LEFT),
        this.getCoordinatesInDirection(row, col, DIRECTIONS.UP_RIGHT),
        this.getCoordinatesInDirection(row, col, DIRECTIONS.DOWN_RIGHT),
        this.getCoordinatesInDirection(row, col, DIRECTIONS.DOWN_LEFT),
      ];

      const neighbors = all
        ? [...edges, ...corners]
        : [...edges];

      return neighbors.filter(n => this.validNeighbor(row, col, n.row, n.col, all));
    },

    /**
     * Gets the opposite direction of the given direction
     * @param {Direction} direction The direction
     * @return {Direction} The opposite direction
     */
    getOppositeDirection(direction) {
      switch (direction) {
        case DIRECTIONS.UP_LEFT: return DIRECTIONS.DOWN_RIGHT;
        case DIRECTIONS.UP: return DIRECTIONS.DOWN;
        case DIRECTIONS.UP_RIGHT: return DIRECTIONS.DOWN_LEFT;
        case DIRECTIONS.RIGHT: return DIRECTIONS.LEFT;
        case DIRECTIONS.DOWN_RIGHT: return DIRECTIONS.UP_LEFT;
        case DIRECTIONS.DOWN: return DIRECTIONS.UP;
        case DIRECTIONS.DOWN_LEFT: return DIRECTIONS.UP_RIGHT;
        case DIRECTIONS.LEFT: return DIRECTIONS.RIGHT;
        case DIRECTIONS.NONE: return DIRECTIONS.NONE;
        default: return direction;
      }
    },

    /**
     * Checks if the board contains a possible match
     * @return {Boolean} Whether there is a possible match or not
     */
    matchPossible() {
      const tileTypes = {};

      this.tiles.forEach((t) => {
        const tileType = t.type;
        if (tileTypes[tileType]) {
          tileTypes[tileType]++;
        } else {
          tileTypes[tileType] = 1;
        }
      });

      // Check if there are 3 or more of one tile type
      return Object.keys(tileTypes).some((type) => tileTypes[type] >= 3);
    },

    /**
     * Checks if all tiles in a match are not removed
     * @param {Match} match The match to check
     * @return {Boolean} Whether the match is valid or not
     */
    validMatch(match) {
      return match.positions.every((p) => !this.getTile(p.row, p.col).removed);
    },

    /**
     * Checks if a move is valid based on it's existence in the moves array
     * @param {Number} row1 The row of the first position
     * @param {Number} col1 The column of the first position
     * @param {Number} row2 The row of the second position
     * @param {Number} col2 The column of the second position
     * @return {Boolean} Whether the move is valid or not
     */
    validMove(row1, col1, row2, col2) {
      const permutations = [
        { row1, col1, row2, col2 },
        { row1: row2, col1: col2, row2: row1, col2: col1 },
      ];
      const props = ['row1', 'col1', 'row2', 'col2'];

      return this.moves.some(move => permutations.some(p => equalOnProps(move, p, props)));
    },

    /**
     * Checks if two positions are neighbors
     * @param {Number} row1 The row of the first position
     * @param {Number} col1 The column of the first position
     * @param {Number} row2 The row of the second position
     * @param {Number} col2 The column of the second position
     * @param {Boolean} all Whether to check corner neighbors or not
     * @return {Boolean} Whether the given positions are neighbors or not
     */
    validNeighbor(row1, col1, row2, col2, all = false) {
      const withinBoard = this.withinBoard(row1, col1) && this.withinBoard(row2, col2);
      const validNeighbor = (
        // Edge neighbors
        (Math.abs(row1 - row2) === 1 && col1 === col2) ||
        (Math.abs(col1 - col2) === 1 && row1 === row2) ||
        // Corner neighbors (if all)
        (all && Math.abs(row1 - row2) === 1 && Math.abs(col1 - col2) === 1)
      );

      return withinBoard && validNeighbor;
    },

    /**
     * Checks if a position is within the board
     * @param {Number} row The row of the position
     * @param {Number} col The column of the position
     * @return {Boolean} Whether the given position is within the board or not
     */
    withinBoard(row, col) {
      return (
        row >= 0 && row < this.rows &&
        col >= 0 && col < this.cols
      );
    },
  },
  created() {
    this.newGame();
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import "~style/functions";
@import "~style/variables";

// Static
$size-min: 2;
$size-max: 9;
$board-width: 700px;  // The width of the board
$board-height: 700px; // The height of the board

$tile-padding: 4px; // Padding between tiles
$tile-radius: 3px; // Border radius on tiles
$tile-font: 'Open Sans', sans-serif;

$colors: $red,
         $orange,
         $green,
         $blue,
         $purple,
         $yellow;

$remove-time: 125ms;
$suggest-time: 2000ms;
$transition-time: 250ms;

// Dynamic
@for $rows from $size-min through $size-max {
  @for $cols from $size-min through $size-max {
    $board-rows-count: $rows; // The number of rows in the board
    $board-cols-count: $cols; // The number of cols in the board

    $tile-width: ($board-width - $tile-padding * ($board-cols-count + 1)) / $board-cols-count;
    $tile-height: ($board-height - $tile-padding * ($board-rows-count + 1)) / $board-rows-count;

    &.board-#{$rows}-#{$cols} {
      // position: absolute;
      position: relative;
      width: $board-width;
      height: $board-height;
      margin: 0 auto;
      border: 2px solid rgba(255, 255, 255, 0);

      .grid-container {
        z-index: 1;
        position: absolute;
        margin: 0 auto;

        .grid-position {
          width: $tile-width;
          height: $tile-height;
          margin-top: $tile-padding;
          margin-left: $tile-padding;
          float: left;
          background: rgba(238, 228, 218, 0.5);
          box-shadow: 0 0 1px $gray-light;
          @include border-radius($tile-radius);
        }
      }

      .tile-container {
        z-index: 2;
        position: absolute;

        .tile {
          z-index: 3;
          position: absolute;
          width: $tile-width;
          height: $tile-height;
          @include border-radius($tile-radius);
          @include transition(all $transition-time ease-out);
          @include transition-property(transform);

          .tile-inner {
            $inner-width: $tile-width * 0.9;
            $inner-height: $tile-height * 0.9;

            z-index: 4;
            width: $inner-width;
            height: $inner-height;
            margin: ($tile-height - $inner-height) / 2 auto;
            box-sizing: border-box;
            box-shadow: 0 0 1px $gray-dark;
            line-height: $inner-height;
            text-align: center;
            @include border-radius($tile-radius);
          }

          .tile-new {
            @include animation(pop $remove-time);
            opacity: 0;
          }

          .tile-neighbor {
            border: 3px solid $gray-light;
          }

          .tile-selected {
            border: 3px solid $gray;
          }

          .tile-suggested {
            @include animation(suggest $suggest-time);
            animation-iteration-count: infinite;
          }

          // Dynamically create .position-{row}-{col} classes to place tiles
          $row-start: 0 - $board-rows-count;
          $row-end: $board-rows-count * 2;
          $col-start: 0 - $board-cols-count;
          $col-end: $board-cols-count * 2;
          @for $row from $row-start to $row-end {
            @for $col from $col-start to $col-end {
              @if ($row >= 0 and $row < $board-rows-count) or ($col >= 0 and $col < $board-cols-count) {
                $newX: $tile-width * $col + ($tile-padding * ($col + 1));
                $newY: $tile-height * $row + ($tile-padding * ($row + 1));

                &.position-#{$row}-#{$col} {
                  @include transform(translate($newX, $newY));
                }
              }
            }
          }

          @for $i from 0 to length($colors) {
            &.type-#{$i} .tile-inner {
              background: nth($colors, $i + 1);
            }
          }
        }
      }
    }

    .border-BUSY {
      // border-color: $red;
    }
  }
}

// Keyframes
@include keyframes(pop) {
  0% {
    opacity: 1;
    @include transform(scale(1));
  }
  50% {
    opacity: .25;
    @include transform(scale(1.4));
  }
  100% {
    opacity: 0;
    @include transform(scale(1));
  }
}

@include keyframes(appear) {
  0% {
    opacity: 0;
    @include transform(scale(0));
  }
  50% {
    opacity: 1;
    @include transform(scale(1.2));
  }
  100% {
    opacity: 1;
    @include transform(scale(1));
  }
}

@include keyframes(suggest) {
  0% {
    box-shadow: 0 0 4px $gray-dark;
  }
  2.5% {
    @include transform(translate(-2px, 0));
  }
  5% {
    @include transform(translate(1px, 0));
  }
  7.5% {
    @include transform(translate(5px, 0));
  }
  10% {
    @include transform(translate(0, 0));
  }
  12.5% {
    @include transform(translate(-6px, 0));
  }
  15% {
    @include transform(translate(1px, 0))
  }
  25% {
    @include transform(rotate(2deg));
  }
  40% {
    @include transform(rotate(-1deg));
  }
  50% {
    box-shadow: 0 0 11px $gray-dark;
  }
  60% {
    @include transform(rotate(0));
  }
  100% {
    box-shadow: 0 0 4px $gray-dark;
  }
}
</style>
