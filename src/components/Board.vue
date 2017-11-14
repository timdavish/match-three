<template>
  <div class="board-container">
    <button class="ai-button"
      @click="aiStatusChange">
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
import { BLOCKERS, DIRECTIONS, POINTS, SPECIALS, STATUS, TIMES, VECTORS } from '../shared/constants';
import { getLines } from '../shared/lines';
import { deepCopy, deepEqual, isBlank, random, waitInPromise } from '../shared/util';

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
      tiles: null,
      matches: null,
      moves: null,
      selection: { selected: false, row: null, col: null, neighbors: [] },
      suggestion: { suggested: false, row1: null, col1: null, row2: null, col2: null },
      suggestionTimer: null,
    };
  },
  computed: {
    // Board data getters
    rows() { return this.boardData.rows; },
    cols() { return this.boardData.cols; },
    positions() { return this.boardData.positions; },
    tileTypes() { return this.boardData.tileTypes; },
  },
  methods: {
    // Starts a new game
    newGame() {
      const { tiles: defaultTiles } = this.boardData;
      const tileCount = defaultTiles.length;
      const positionCount = this.positions.filter((p) => p.active).length;

      // Set the board's tiles
      this.tiles = tileCount === positionCount
        ? defaultTiles
        : this.getStartingTiles();

      // Set other properties
      this.matches = [];
      this.moves = [];

      // Run our game loop before allowing user interaction
      this.gameLoop();
    },

    // Initializes new starting tiles
    getStartingTiles() {
      // Reset tiles
      const tiles = [];
      const rows = this.rows;
      const cols = this.cols;

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const position = this.getPosition(row, col);

          // Make sure the position can contain a tile
          if (this.isActivePosition(position)) {
            tiles.push({
              id: this.coordinatesToIndex({ row, col }),
              row,
              col,
              type: this.getRandomTileType(),
              special: SPECIALS.NONE,
              shifts: [],
              removed: false
            });
          }
        }
      }

      return tiles;
    },

    // The main game loop
    gameLoop() {
      // Return promise for chaining, set game status to busy
      return this.setGameStatus(STATUS.BUSY)
        // Then resolve any matches
        .then(() => this.resolveMatches())
        // Then ensure that there is an available move
        .then(() => this.ensureMove())
        // Then set game status to idle
        .then(() => this.setGameStatus(STATUS.IDLE))
        // Then check if ai is active
        .then(() => {
          if (this.ai) {
            // Make an ai move
            return this.aiMove();
          } else {
            // Start giving a move suggestion
            return this.giveSuggestion();
          }
        })
        // Catch a 'game over' scenario where no moves are possible
        .catch((error) => console.log(error));
    },

    // Sets the game status
    setGameStatus(status) {
      this.status = status;

      // Return promise for chaining
      return Promise.resolve(status);
    },

    // Resolves matches
    resolveMatches() {
      // Check for matches
      this.findMatches();

      // Base case
      if (this.matches.length <= 0) {
        return Promise.resolve();
      }

      // Return promise for chaining, handle matches
      return this.handleMatches()
        // Then handle removed specials
        .then((data) => this.handleSpecials(data))
        // Then set any newly created specials
        .then((data) => this.setSpecialTiles(data))
        // Then handle tile shifting
        .then(() => this.setTileShifts())
        .then(() => this.shiftTiles())
        // Then handle exploded wrapped specials
        .then(() => this.handleExplodedSpecialWrappeds())
        // Then handle tile shifting
        .then(() => this.setTileShifts())
        .then(() => this.shiftTiles())
        // Then rerun the entire process until no matches are created
        .then(() => this.resolveMatches());
    },

    // Ensures that the user has an available move
    ensureMove() {
      // Check for moves
      this.findMoves();

      return new Promise((resolve) => {
        if (this.moves.length <= 0) {
          resolve(this.shuffleTiles());
        } else {
          resolve();
        }
      });
    },

    // Change the ai status
    aiStatusChange() {
      this.ai = !this.ai;

      // We don't need to do anything if the board is busy
      if (this.status === STATUS.IDLE) {
        if (this.ai) {
          // AI was enabled while the board was idle
          this.aiMove();
        } else {
          // AI was disabled while the board was idle
          this.giveSuggestion();
        }
      }
    },

    // Makes an ai move
    aiMove() {
      // Clear selection and suggestion
      this.clearSelection();
      this.clearSuggestion();

      // 'Think' for a random amount of time
      const thinkTime = random(TIMES.WAITS.THINK_MINIMUM, TIMES.WAITS.THINK_MAXIMUM);

      // Helper function
      const aiMoveFinish = () => {
        // Make sure ai is still enabled, then attempt swap
        if (this.ai) {
          const { row1, col1, row2, col2 } = this.moves[0];

          return this.attemptSwap(row1, col1, row2, col2);
        } else {
          // Return promise for chaining
          return Promise.resolve();
        }
      };

      // Return promise for chaining
      return Promise.resolve()
        // Wait for thinking
        .then(waitInPromise(thinkTime))
        // Then finish ai move
        .then(aiMoveFinish);
    },

    // Clears the tile selection
    clearSelection() {
      this.selection = { selected: false, row: null, col: null, neighbors: [] };
    },

    // Gives a move suggestion
    giveSuggestion() {
      this.suggestionTimer = setTimeout(() => {
        const { row1, col1, row2, col2 } = this.moves[0];

        this.suggestion = { suggested: true, row1, col1, row2, col2 };
      }, TIMES.WAITS.SUGGESTION);

      // Return promise for chaining
      return Promise.resolve();
    },

    // Clears the move suggestion
    clearSuggestion() {
      clearTimeout(this.suggestionTimer);
      this.suggestion = { suggested: false, row1: null, col1: null, row2: null, col2: null };
    },

    // Finds all current available matches
    findMatches() {
      // Reset matches
      let matches = [];

      // Calculate best match for each board position
      this.positions.forEach((p) => {
        const { row, col, active } = p;

        if (active) {
          const match = this.calculateBestMatch(row, col);
          if (match !== null) {
            matches.push(match);
          }
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

      // Return promise for chaining
      return Promise.resolve();
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
            // Swap, find matches, swap back
            this.swapTiles(row, col, row, col + 1, true);
            this.findMatches();
            this.swapTiles(row, col, row, col + 1, true);
            // Check if the swap made a match
            if (this.matches.length > 0) {
              // Found at least one valid move
              const priorities = this.matches.map(m => m.priority);
              moves.push({ row1: row, col1: col, row2: row, col2: col + 1, priorities });
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
            // Swap, find matches, swap back
            this.swapTiles(row, col, row + 1, col, true);
            this.findMatches();
            this.swapTiles(row, col, row + 1, col, true);
            // Check if the swap made a match
            if (this.matches.length > 0) {
              // Found at least one valid move
              const priorities = this.matches.map(m => m.priority);
              moves.push({ row1: row, col1: col, row2: row + 1, col2: col, priorities });
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

    // Handle match removals
    // Animation timing: REMOVE
    handleMatches() {
      const tiles = this.tiles;

      // Keep track of points
      let points = 0;
      // Keep track of removed matches
      let removedMatches = [];
      // Keep track of removed specials to pass down the chain
      let removedSpecials = [];

      for (let match of this.matches) {
        if (this.validMatch(match)) {
          match.positions.forEach((p) => {
            const { row, col } = p;
            const tile = this.getTile(row, col);
            const special = tile.special;

            // Add points from tile
            points += POINTS.TILE;

            // Keep track of specials
            if (special !== SPECIALS.NONE) {
              removedSpecials.push(deepCopy(tile));
            }

            // Remove the tile normally
            this.removeTile(tile);
          });

          // Add bonus points from matches
          points += match.bonusPoints;
          removedMatches.push(match);
        }
      }

      // Return promise for chaining
      return Promise.resolve({ removedMatches, removedSpecials })
        // Wait for animation
        .then(waitInPromise(TIMES.ANIMATIONS.REMOVE))
        // Add score
        .then(this.addScore(points));
    },

    // Handle special tile removals
    handleSpecials({ removedMatches, removedSpecials }) {
      // Promise.all makes sure we wait for all the animations to finish
      return Promise.all([
        Promise.resolve(removedMatches),
        ...removedSpecials.map(tile => {
          const { row, col, special } = tile;

          switch (special) {
            // case SPECIALS.PAINTER: {
            //   console.log('painter go boom', tile);
            //   break;
            // }
            // case SPECIALS.BOMB: {
            //   console.log('bomb go boom', tile);
            //   break;
            // }
            case SPECIALS.WRAPPED: {
              return this.handleSpecialWrapped(row, col);
            }
            // case SPECIALS.WRAPPED_EXPLODED: {
            //   return this.handleSpecialWrapped(row, col, true);
            // }
            case SPECIALS.STRIPED_H: {
              const directions = [DIRECTIONS.LEFT, DIRECTIONS.RIGHT];
              return this.handleSpecialStriped(directions, row, col);
            }
            case SPECIALS.STRIPED_V: {
              const directions = [DIRECTIONS.UP, DIRECTIONS.DOWN];
              return this.handleSpecialStriped(directions, row, col);
            }
            case SPECIALS.FISH: {
              return this.handleSpecialFish(row, col);
            }
          }
        }),
      ]);
    },

    // Handle special wrapped tiles
    handleSpecialWrapped(row, col, exploded = false) {
      const tile = this.getTile(row, col);

      if (!exploded) {
        // Make this position's tile an exploded wrapped
        tile.removed = false;
        tile.special = SPECIALS.WRAPPED_EXPLODED;
      } else {
        this.removeTile(tile);
      }

      const neighbors = this.getValidNeighbors(row, col, true);

      // Promise.all makes sure we wait for all the animations to finish
      return Promise.all(neighbors.map(n => {
        return new Promise(resolve => {
          setTimeout(() => {
            // Save this position
            const positionCopy = deepCopy(this.getPosition(n.row, n.col));
            resolve(
              // Hit this position and check for chain reactions
              this.hitPosition(positionCopy).then(this.postHitPosition)
            );
          }, TIMES.ANIMATIONS.WRAPPED);
        });
      }));
    },

    // Handle exploded special wrapped tiles
    handleExplodedSpecialWrappeds() {
      const explodeds = this.tiles.filter(tile => tile.special === SPECIALS.WRAPPED_EXPLODED);

      return Promise.all(explodeds.map(tile => {
        const { row, col } = tile;

        return this.handleSpecialWrapped(row, col, true)


        // return new Promise(resolve => {
        //   setTimeout(() => {
        //     const { row, col } = tile;
        //
        //     resolve(
        //       // Blow up exploded special wrappeds
        //       this.handleSpecialWrapped(row, col, true)
        //     );
        //   }, TIMES.ANIMATIONS.WRAPPED);
        // });
      }));
    },

    // Handle special striped tiles
    handleSpecialStriped(directions, row, col) {
      // Get and filter positions in directions that we need to hit next
      const filteredCoords = directions.map(direction => {
        const coords = this.getCoordinatesInDirection(row, col, direction);
        return { ...coords, direction };
      }).filter(c => this.withinBoard(c.row, c.col));

      // Save this position
      const positionCopy = deepCopy(this.getPosition(row, col));

      // Promise.all makes sure we wait for all the animations to finish
      return Promise.all([
        // Hit this position and check for chain reactions
        this.hitPosition(positionCopy).then(this.postHitPosition),
        // Recurse to more positions if there are any
        ...filteredCoords.map(coords => {
          const { row: nextRow, col: nextCol, direction } = coords;

          return new Promise(resolve => {
            setTimeout(() => resolve(
              this.handleSpecialStriped([direction], nextRow, nextCol)
            ), TIMES.ANIMATIONS.STRIPED);
          });
        }),
      ]);
    },

    // Handle special fish tiles
    handleSpecialFish(row, col) {
      // Promise makes sure we wait for all the animations to finish
      return new Promise(resolve => {
        let randomRow = random(this.rows - 1);
        let randomCol = random(this.cols - 1);

        // Make sure we choose a different random position
        while (randomRow === row && randomCol === col) {
          randomRow = random(this.rows - 1);
          randomCol = random(this.cols - 1);
        }

        setTimeout(() => {
          // Save this position
          const positionCopy = deepCopy(this.getPosition(randomRow, randomCol));
          resolve(
            // Hit this position and check for chain reactions
            this.hitPosition(positionCopy).then(this.postHitPosition)
          );
        }, TIMES.ANIMATIONS.FISH);
      });
    },

    postHitPosition({ points, status, payload }) {
      // Check for a special chain reaction
      if (status === 2) {
        // Chain reaction
        return this.handleSpecials({ removedSpecials: payload });
      }

      return Promise.resolve();
    },

    // Add points to the level score
    addScore(points) {
      // Add the points
      this.$emit('addScore', points);
    },

    // Set any special tiles that were created
    setSpecialTiles([ removedMatches ]) {
      for (let match of removedMatches) {
        const special = match.special;

        if (special !== SPECIALS.NONE) {
          // TODO: if this special was created directly by the user, set the
          // tile at the swap position
          const pos = null || match.positions[0];
          const tile = this.getTile(pos.row, pos.col);

          tile.removed = false;
          tile.special = special;
        }
      }

      // Return promise for chaining
      return Promise.resolve(removedMatches);
    },

    // Sets all tile's shifts
    setTileShifts() {
      // Filter positions for column start positions that aren't blocked
      const columnStarts = this.positions.filter((p) => p.columnStart && p.blocker === BLOCKERS.NONE);

      // Set shifts for each tile in each column
      columnStarts.forEach((startPosition) => {
        const shifts = [];
        const newTiles = [];

        // Set non-new tile shifts
        this.reverseIterateColumn(startPosition, (curPosition) => {
          const { row, col, feedDirection } = curPosition;

          const tile = this.getTile(row, col);
          const newShift = this.getOppositeDirection(feedDirection);

          if (tile.removed) {
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

        // Set new tile shifts and starting location
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

      // Return promise for chaining
      return Promise.resolve();
    },

    // Shifts all shiftable tiles
    // Animation timing: SHIFT
    shiftTiles() {
      // Filter tiles for tiles with shifts
      const shiftableTiles = this.tiles.filter((tile) => tile.shifts.length > 0);

      // Base case
      if (shiftableTiles.length <= 0) {
        // Return promise for chaining
        return Promise.resolve()
          // Wait for animation
          .then(waitInPromise(TIMES.ANIMATIONS.SHIFT));
      }

      // Recursive case
      return new Promise((resolve) => {
        setTimeout(() => {
          shiftableTiles.forEach((tile) => {
            const direction = tile.shifts.shift();

            let { row, col } = this.getCoordinatesInDirection(tile.row, tile.col, direction);

            tile.row = row;
            tile.col = col;

            if (tile.removed && this.withinBoard(row, col)) {
              tile.removed = false;
            }
          });

          resolve(this.shiftTiles());
        }, TIMES.ANIMATIONS.SHIFT);
      });
    },

    // Shuffles all available tiles
    // Animation timing: SHUFFLE
    shuffleTiles() {
      if (!this.matchPossible()) {
        return Promise.reject('No permutation of the board results in a possible move.');
      }

      const tiles = this.tiles;
      const last = tiles.length - 1;

      // Shuffle tiles until a match is possible, but a match isn't made
      while (this.moves.length <= 0 || this.matches.length > 0) {
        for (let index = 0; index <= last; index += 1) {
          const rand = random(index, last);
          const { row: row1, col: col1 } = tiles[index];
          const { row: row2, col: col2 } = tiles[rand];
          this.swapTiles(row1, col1, row2, col2);
        }

        // Update moves and matches
        this.findMoves();
        this.findMatches();
      }

      // Return promise for chaining
      return Promise.resolve()
        // Wait for animation
        .then(waitInPromise(TIMES.ANIMATIONS.SHUFFLE));
    },

    // Handles a board touch
    // Animation timing: SWAP
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
    attemptSwap(row1, col1, row2, col2) {
      // Set game status to busy
      this.setGameStatus(STATUS.BUSY)
        // Swap the two tiles
        .then(() => this.swapTiles(row1, col1, row2, col2))
        // Check if this is a move that makes a match
        .then(() => {
          if (this.validMove(row1, col1, row2, col2)) {
            // Decrement moves and run the game loop
            this.addMoves();
            return this.gameLoop();
          } else {
            // Set game status to idle and swap the two tiles back
            this.setGameStatus(STATUS.IDLE);
            return this.swapTiles(row1, col1, row2, col2);
          }
        });
    },

    swapTiles(row1, col1, row2, col2, instant = false) {
      const tile1 = this.getTile(row1, col1);
      const tile2 = this.getTile(row2, col2);

      this.setTileAt(tile1, row2, col2);
      this.setTileAt(tile2, row1, col1);

      // Return promise for chaining
      return Promise.resolve()
        // Wait for animation
        .then(waitInPromise(!instant ? TIMES.ANIMATIONS.SWAP : 0));
    },

    // Add to the level moves
    addMoves(moves = -1) {
      this.$emit('addMoves', moves);
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

    getRandomTileType() {
      return random(this.tileTypes.length - 1);
    },

    setTileAt(tile, row, col) {
      tile.row = row;
      tile.col = col;
    },

    removeTile(tile) {
      tile.removed = true;
      tile.special = SPECIALS.NONE;
    },

    hitPosition(position) {
      // Return a new promise with the resulting points from this position hit
      return new Promise(resolve => {
        let status = 1;
        let payload = [];

        // First check if there's a blocker on the position, to prevent
        // hitting a blocked tile, if there is one under the blocker
        if (this.hasBlocker(position)) {
          this.hitBlocker(position);
        } else {
          // If there is a tile to hit, hit it and resolve with tile points
          const tile = this.getTile(position.row, position.col);
          if (tile && !tile.removed && tile.special) {
            if (tile.special !== SPECIALS.NONE) {
              status = 2;
              payload.push(deepCopy(tile));
            }

            this.removeTile(tile);
            this.addScore(POINTS.TILE);
          }
        }

        resolve({ status, payload });
      });
    },

    isActivePosition(position) {
      return (
        position.active &&
        !this.hasBlocker(position)
      );
    },

    hasBlocker(position) {
      return position.blocker !== BLOCKERS.NONE;
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
        case (DIRECTIONS.UP_LEFT): return DIRECTIONS.DOWN_RIGHT;
        case (DIRECTIONS.UP): return DIRECTIONS.DOWN;
        case (DIRECTIONS.UP_RIGHT): return DIRECTIONS.DOWN_LEFT;
        case (DIRECTIONS.RIGHT): return DIRECTIONS.LEFT;
        case (DIRECTIONS.DOWN_RIGHT): return DIRECTIONS.UP_LEFT;
        case (DIRECTIONS.DOWN): return DIRECTIONS.UP;
        case (DIRECTIONS.DOWN_LEFT): return DIRECTIONS.UP_RIGHT;
        case (DIRECTIONS.LEFT): return DIRECTIONS.RIGHT;
        case (DIRECTIONS.NONE): return DIRECTIONS.NONE;
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

      return this.moves.some((move) => {
        // Pull only rows and cols from move to check against
        const _move = { row1: move.row1, col1: move.col1, row2: move.row2, col2: move.col2 };
        return permutations.some((p) => deepEqual(_move, p));
      });
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
$transition-time: 300ms;

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
