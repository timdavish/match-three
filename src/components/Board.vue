<template>
  <div :class="['board_' + rows + '_' + cols, 'border_' + status]">
    <div class="grid-container">
      <div class="grid-position"
        v-for="position in positions" :key="position.id">
      </div>
    </div>
    <transition-group name="tile" tag="div" class="tile-container">
      <tile
        v-for="tile in tiles" :key="tile.id"
        :tile="tile"
        :selected="selectedTile"
        @touch="tileTouch(tile)">
      </tile>
    </transition-group>
  </div>
</template>

<script>
/* eslint-disable */

import Tile from './Tile';
import { ANIMATION_TIMES, DIRECTIONS } from '../shared/constants';
import { deepCopy, deepEqual, random, waitInPromise } from '../util/util';

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
      status: 'BUSY',
      tiles: null,
      matches: null,
      moves: null,
      selectedTile: { selected: false, row: null, col: null, neighbors: [] },
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
      const positionCount = this.positions.filter((p) => p.isActive).length;

      // Set the board's tiles
      this.tiles = tileCount === positionCount
        ? defaultTiles
        : this.getNewTiles();

      // Set other properties
      this.matches = [];
      this.moves = [];

      // Run our game loop before allowing user interaction
      this.gameLoop();
    },

    // Initializes new tiles
    getNewTiles() {
      // Reset tiles
      const tiles = [];
      const rows = this.rows;
      const cols = this.cols;

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const id = this.coordinatesToIndex({ row, col });
          const tile = { id, row, col, type: this.getRandomTileType(), shifts: [], removed: false };
          tiles.push(tile);
        }
      }

      return tiles;
    },

    // The main game loop
    gameLoop() {
      // Return promise for chaining, set status to busy
      return this.setStatus('BUSY')
        // Then resolve any matches
        .then(() => this.resolveMatches())
        // Then ensure that there is an available move
        .then(() => this.ensureMove())
        // Then set status to idle
        .then(() => this.setStatus('IDLE'))
        // Catch a 'game over' scenario where no moves are possible
        .catch((error) => console.log(error));
    },

    // Resolves matches
    resolveMatches() {
      // Check for matches
      this.findMatches();

      // Base case
      if (this.matches.length <= 0) {
        return Promise.resolve();
      }

      // Return promise for chaining
      return this.removeMatches()
        .then(() => this.setTileShifts())
        .then(() => this.shiftTiles())
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

    // Finds all current available matches
    findMatches() {
      // Reset matches
      let matches = [];

      // Calculate best match for each board position
      this.positions.forEach((p) => {
        const { row, col, isActive } = p;

        if (isActive) {
          const match = this.calculateBestMatch(row, col);
          if (match !== null) {
            matches.push(match);
          }
        }
      });

      // Sort matches by length so that we remove the better ones first
      this.matches = matches.sort((a, b) => a.length < b.length);

      // Return promise for chaining
      return Promise.resolve();
    },

    // Finds all current available moves
    findMoves() {
      // Reset moves
      const moves = [];

      // Find horizontal moves
      for (let row = 0; row < this.rows; row += 1) {
        for (let col = 0; col < this.cols - 1; col += 1) {
          // Swap, find matches, swap back
          this.swapTiles(row, col, row, col + 1);
          this.findMatches();
          this.swapTiles(row, col, row, col + 1);

          // Check if the swap made a match
          if (this.matches.length > 0) {
            // Found a valid move
            moves.push({ row1: row, col1: col, row2: row, col2: col + 1 });
          }
        }
      }

      // Find vertical moves
      for (let col = 0; col < this.cols; col += 1) {
        for (let row = 0; row < this.rows - 1; row += 1) {
          // Swap, find matches, swap back
          this.swapTiles(row, col, row + 1, col);
          this.findMatches();
          this.swapTiles(row, col, row + 1, col);

          // Check if the swap made a match
          if (this.matches.length > 0) {
            // Found a valid move
            moves.push({ row1: row, col1: col, row2: row + 1, col2: col });
          }
        }
      }

      // Reset matches
      this.matches = [];
      this.moves = moves;

      // Return promise for chaining
      return Promise.resolve();
    },

    // Removes all possible matches
    // Animation timing: REMOVE
    removeMatches() {
      const tiles = this.tiles;

      for (let match of this.matches) {
        if (this.validMatch(match)) {
          match.forEach((v) => this.getTile(v.row, v.col).removed = true );
        }
      }

      // Return promise for chaining
      return Promise.resolve()
        // Wait for animation
        .then(waitInPromise(ANIMATION_TIMES.REMOVE));
    },

    // Sets all tile's shifts
    setTileShifts() {
      // Filter positions for column start positions that aren't frozen
      const columnStarts = this.positions.filter((p) => p.isColumnStart && !p.isFrozen);

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
          ({ row, col } = this.getNextCoordinatesFromDirection(row, col, columnStartFeedDirection));

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
          .then(waitInPromise(ANIMATION_TIMES.SHIFT));
      }

      // Recursive case
      return new Promise((resolve) => {
        setTimeout(() => {
          shiftableTiles.forEach((tile) => {
            const direction = tile.shifts.shift();

            let { row, col } = this.getNextCoordinatesFromDirection(tile.row, tile.col, direction);

            tile.row = row;
            tile.col = col;

            if (tile.removed && this.withinBoard(row, col)) {
              tile.removed = false;
            }
          });

          resolve(this.shiftTiles());
        }, ANIMATION_TIMES.SHIFT);
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
        .then(waitInPromise(ANIMATION_TIMES.SHUFFLE));
    },

    // Handles a board touch
    // Animation timing: SWAP
    tileTouch(tile) {
      // Only allow tile touches while game is idle
      if (this.status === 'IDLE') {
        const { selected, row, col } = this.selectedTile;
        const { row: newRow, col: newCol } = tile;

        // Check if the position is selectable
        if (!selected || row !== newRow || col !== newCol) {
          // Check if the position is a current neighbor
          if (this.validNeighbor(row, col, newRow, newCol)) {
            // Remove board selection
            this.selectedTile = { selected: false, row: null, col: null, neighbors: [] };

            // Swap the two tiles
            this.swapTiles(row, col, newRow, newCol);

            // Check for match(es)
            if (this.validMove(row, col, newRow, newCol)) {
              // Run the game loop
              setTimeout(() => this.gameLoop(), ANIMATION_TIMES.SWAP);
            } else {
              // Swap the two tiles back
              setTimeout(() => this.swapTiles(row, col, newRow, newCol), ANIMATION_TIMES.SWAP);
            }

          } else {
            // Refresh our selected position
            const newNeighbors = this.getValidNeighbors(newRow, newCol);

            this.selectedTile = { selected: true, row: newRow, col: newCol, neighbors: newNeighbors };
          }
        } else {
          // Remove board selection
          this.selectedTile = { selected: false, row: null, col: null, neighbors: [] };
        }
      }

      // Return promise for chaining
      return Promise.resolve();
    },

    /**
     * Helper Functions
     */

    setStatus(status) {
      this.status = status;

      // Return promise for chaining
      return Promise.resolve(status);
    },

    getTile(row, col) {
      return this.tiles.find((t) => t.row === row && t.col === col);
    },

    getPosition(row, col) {
      return this.positions.find((p) => p.row === row && p.col === col);
    },

    getRandomTileType() {
      return random(this.tileTypes.length - 1);
    },

    swapTiles(row1, col1, row2, col2) {
      const tile1 = this.getTile(row1, col1);
      const tile2 = this.getTile(row2, col2);

      this.setTileAt(tile1, row2, col2);
      this.setTileAt(tile2, row1, col1);
    },

    setTileAt(tile, row, col) {
      tile.row = row;
      tile.col = col;
    },

    reverseIterateColumn(position, func) {
      // Recurse until this column stops
      if (position.flowDirection !== 'NONE') {
        // The column isn't supposed to stop here, so check next position
        // to see if it's frozen
        const nextPosition = this.getNextPositionFromFlow(position);
        if (!nextPosition.isFrozen) {
          // We're good to recurse
          this.reverseIterateColumn(nextPosition, func);
        }
      }

      // Then do something with this position
      func(position);
    },

    calculateBestMatch(row, col) {
      let match = null;

      // Lines are sorted by preference, so that the best match is found first
      const lines = this.getValidLines(row, col);

      if (lines.length > 0) {
        const type = this.getTile(row, col).type;

        // Loop through the lines
        lines.some((line) => {
          // We have a match if for every index in the line the tile type is the same
          const hasMatch = line.every((v) => this.getTile(v.row, v.col).type === type);

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
      // Sorted by preference, so that the best match is found first
      const lines = [
        // 1x5 match w/ 2 extra
        // 1x5 match w/ 2 extra
        // 1x5 match w/ 1 extra
        // 1x5 match w/ 1 extra
        // 1x5 match
        [{ row, col }, { row, col: col + 1 }, { row, col: col + 2 }, { row, col: col + 3 }, { row, col: col + 4 }],
        // 5x1 match w/ 2 extra
        // 5x1 match w/ 2 extra
        // 1x5 match w/ 1 extra
        // 1x5 match w/ 1 extra
        // 5x1 match
        [{ row, col }, { row: row + 1, col }, { row: row + 2, col }, { row: row + 3, col }, { row: row + 4, col }],
        // 1x4 match
        [{ row, col }, { row, col: col + 1 }, { row, col: col + 2 }, { row, col: col + 3 }],
        // 4x1 match
        [{ row, col }, { row: row + 1, col }, { row: row + 2, col }, { row: row + 3, col }],
        // 2x2 match w/ 1 extra (TOP_LEFT)
        [{ row, col }, { row, col: col + 1 }, { row: row + 1, col: col + 1 }, { row: row + 1, col }, { row: row - 1, col }],
        // 2x2 match w/ 1 extra (TOP_RIGHT)
        [{ row, col }, { row, col: col + 1 }, { row: row + 1, col: col + 1 }, { row: row + 1, col }, { row: row - 1, col: col + 1 }],
        // 2x2 match w/ 1 extra (RIGHT_TOP)
        [{ row, col }, { row, col: col + 1 }, { row: row + 1, col: col + 1 }, { row: row + 1, col }, { row, col: col + 2 }],
        // 2x2 match w/ 1 extra (RIGHT_BOTTOM)
        [{ row, col }, { row, col: col + 1 }, { row: row + 1, col: col + 1 }, { row: row + 1, col }, { row: row + 1, col: col + 2 }],
        // 2x2 match w/ 1 extra (BOTTOM_RIGHT)
        [{ row, col }, { row, col: col + 1 }, { row: row + 1, col: col + 1 }, { row: row + 1, col }, { row: row + 2, col: col + 1 }],
        // 2x2 match w/ 1 extra (BOTTOM_LEFT)
        [{ row, col }, { row, col: col + 1 }, { row: row + 1, col: col + 1 }, { row: row + 1, col }, { row: row + 2, col }],
        // 2x2 match w/ 1 extra (LEFT_BOTTOM)
        [{ row, col }, { row, col: col + 1 }, { row: row + 1, col: col + 1 }, { row: row + 1, col }, { row: row + 1, col: col - 1 }],
        // 2x2 match w/ 1 extra (LEFT_TOP)
        [{ row, col }, { row, col: col + 1 }, { row: row + 1, col: col + 1 }, { row: row + 1, col }, { row, col: col - 1 }],
        // 2x2 match
        [{ row, col }, { row, col: col + 1 }, { row: row + 1, col: col + 1 }, { row: row + 1, col }],
        // 1x3 match
        [{ row, col }, { row, col: col + 1 }, { row, col: col + 2 }],
        // 3x1 match
        [{ row, col }, { row: row + 1, col }, { row: row + 2, col }],
      ];

      // Filter out lines that don't fit
      return lines.filter((line) => line.every((v) => this.withinBoard(v.row, v.col)));
    },

    getNextPositionFromFlow(position) {
      const { row, col, flowDirection } = position;
      const { row: nextRow, col: nextCol } =
        this.getNextCoordinatesFromDirection(row, col, flowDirection, true);

      return this.getPosition(nextRow, nextCol);
    },

    getNextCoordinatesFromDirection(row, col, direction) {
      switch (direction) {
        case (DIRECTIONS.DOWN): return { row: row + 1, col };
        case (DIRECTIONS.UP): return { row: row - 1, col };
        case (DIRECTIONS.RIGHT): return { row, col: col + 1 };
        case (DIRECTIONS.LEFT): return { row, col: col - 1 };
        default: return { row, col };
      }
    },

    getOppositeDirection(direction) {
      switch (direction) {
        case (DIRECTIONS.DOWN): return DIRECTIONS.UP;
        case (DIRECTIONS.UP): return DIRECTIONS.DOWN;
        case (DIRECTIONS.RIGHT): return DIRECTIONS.LEFT;
        case (DIRECTIONS.LEFT): return DIRECTIONS.RIGHT;
        default: return direction;
      }
    },

    getValidNeighbors(row, col) {
      const neighbors = [
        this.getNextCoordinatesFromDirection(row, col, DIRECTIONS.DOWN),
        this.getNextCoordinatesFromDirection(row, col, DIRECTIONS.UP),
        this.getNextCoordinatesFromDirection(row, col, DIRECTIONS.RIGHT),
        this.getNextCoordinatesFromDirection(row, col, DIRECTIONS.LEFT),
      ];
      return neighbors.filter(n => this.validNeighbor(row, col, n.row, n.col));
    },

    coordinatesToIndex(pos) {
      return (pos.row * this.cols) + pos.col;
    },

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

      return Object.keys(tileTypes).some((type) => tileTypes[type] >= 3);
    },

    validMatch(match) {
      return match.every((i) => !this.getTile(i.row, i.col).removed);
    },

    validMove(row1, col1, row2, col2) {
      const permutations = [
        { row1, col1, row2, col2 },
        { row1: row2, col1: col2, row2: row1, col2: col1 },
      ];

      return this.moves.some((move) => permutations.some((p) => deepEqual(move, p)));
    },

    validNeighbor(row1, col1, row2, col2) {
      return (
        this.withinBoard(row1, col1) && this.withinBoard(row2, col2) &&
        (Math.abs(row1 - row2) === 1 && col1 === col2) ||
        (Math.abs(col1 - col2) === 1 && row1 === row2)
      );
    },

    withinBoard(row, col) {
      return (
        row >= 0 && row < this.rows &&
        col >= 0 && col < this.cols
      );
    },
  },
  mounted() {
    this.newGame();
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
@import "../assets/scss/functions";

// Static
$board-width: 700px;  // The width of the board
$board-height: 700px; // The height of the board

$tile-padding: 4px; // Padding between tiles
$tile-radius: 3px; // Border radius on tiles
$tile-font: 'Open Sans', sans-serif;

$colors: blue,
         green,
         orange,
         purple,
         red,
         yellow;

$remove-time: 125ms;
$transition-time: 300ms;

// Dynamic
@for $rows from 2 through 9 {
  @for $cols from 2 through 9 {
    $board-rows-count: $rows; // The number of rows in the board
    $board-cols-count: $cols; // The number of cols in the board

    $tile-width: ($board-width - $tile-padding * ($board-cols-count + 1)) / $board-cols-count;
    $tile-height: ($board-height - $tile-padding * ($board-rows-count + 1)) / $board-rows-count;

    &.board_#{$rows}_#{$cols} {
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
            line-height: $inner-height;
            text-align: center;
            @include border-radius($tile-radius);
          }

          &.tile-new .tile-inner {
            @include animation(pop $remove-time);
            opacity: 0;
          }

          .tile-selected {
            border: 2px solid yellow;
          }

          .tile-neighbor {
            border: 2px solid black;
          }

          // Dynamically create .position_{row}_{col} classes to place tiles
          $row-start: 0 - $board-rows-count;
          $row-end: $board-rows-count * 2;
          $col-start: 0 - $board-cols-count;
          $col-end: $board-cols-count * 2;
          @for $row from $row-start to $row-end {
            @for $col from $col-start to $col-end {
              @if ($row >= 0 and $row < $board-rows-count) or ($col >= 0 and $col < $board-cols-count) {
                $newX: $tile-width * $col + ($tile-padding * ($col + 1));
                $newY: $tile-height * $row + ($tile-padding * ($row + 1));

                &.position_#{$row}_#{$col} {
                  @include transform(translate($newX, $newY));
                }
              }
            }
          }

          @for $i from 0 to length($colors) {
            &.type_#{$i} .tile-inner {
              background: nth($colors, $i + 1);
            }
          }
        }
      }
    }

    .border-BUSY {
      border-color: red;
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

// Declare transition
.fade-move, .fade-enter-active, .fade-leave-active {
  transition: all .5s cubic-bezier(.55, 0, .1, 1);
}

// Declare enter from and leave to state
.fade-enter, .fade-leave-to {
  opacity: 0;
  transform: scaleY(0.01) translate(30px, 0);
}

// Ensure leaving items are taken out of layout flow so that moving
// animations can be calculated correctly
.fade-leave-active {
  position: absolute;
}
</style>
