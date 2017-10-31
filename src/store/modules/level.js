/* eslint-disable */

import * as types from '../mutation-types';
import { deepCopy, random } from '../../util/util';
import { REMOVETIME, TRANSITIONTIME, DIRECTIONS, TILETYPES } from './constants';

const state = {
  id: 1,
  type: 'SCORE',
  moveCount: 15,
  scores: { one: 10, two: 20, three: 30 },
  score: 0,

  rows: 5,
  cols: 5,
  tileTypes: [TILETYPES.BLUE, TILETYPES.GREEN, TILETYPES.ORANGE/*, TILETYPES.PURPLE, TILETYPES.RED, TILETYPES.YELLOW*/],

  // { row, col, isColumnStart, flowDirection, feedDirection }
  positions: [],

  // { row, col, id, type }
  tiles: [],

  // { row1, col1, row2, col2 }
  moves: [],

  // [{ row, col }]
  matches: [],

  selectedTile: { selected: false, row: null, col: null, neighbors: [] },
};

const getters = {
  id: state => state.id,
  type: state => state.type,
  moveCount: state => state.moveCount,
  scores: state => state.scores,
  score: state => state.score,

  positions: state => state.positions,
  tiles: state => state.tiles,
  tilesWithShifts: state => state.tiles.filter(t => t.shifts.length > 0),
  tileTypes: state => state.tileTypes,

  selected: state => state.selectedTile,
};

const actions = {
  initBoard({ commit, state }) {
    // Reset positions and tiles
    const positions = [];
    const tiles = [];
    const rows = state.rows;
    const cols = state.cols;

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const id = coordinatesToIndex({ row, col });
        let position = { row, col, isColumnStart: false, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP };
        let tile = { row, col, id, type: -1, shifts: [] };

        if (row === 0) {
          // First row
          position = {
            ...position,
            isColumnStart: true,
          };
        } else if (row === rows - 1) {
          // Last row
          position = {
            ...position,
            flowDirection: DIRECTIONS.NONE,
          };
        }

        positions.push(position);
        tiles.push(tile);
      }
    }

    commit(types.INIT_POSITIONS, positions);
    commit(types.INIT_TILES, tiles);
  },

  startGame({ commit, dispatch, state }) {
    // let done = false;
    // while (!done) {
      // Fill the board with random tiles
      // dispatch('shiftTiles');

      // Resolve any matches
      // dispatch('resolveMatches');

      // Check if there are valid moves
      // dispatch('findMoves');

      // Done if there is at least one valid move
      // if (state.moves.length > 0) {
      // done = true;
      // }
      // done = true;
    // }
  },

  resolveMatches({ commit, dispatch, state }) {
    // Check for matches
    dispatch('findMatches');

    // Get rid of any matches
    while (state.matches.length > 0) {
      // Remove matches
      dispatch('removeMatches');

      // TODO: Figure out how to wait for animations
      // Shift tiles, waiting for remove animation
      // setTimeout(() => dispatch('shiftTiles'), 1500);
      dispatch('shiftTiles');

      // Check for newly created matches, waiting for shift animation
      // setTimeout(() => dispatch('findMatches'), 1500);
      dispatch('findMatches');
    }
  },

  findMatches({ commit, state }) {
    // Reset matches
    const matches = [];
    const tiles = deepCopy(state.tiles);

    // Calculate best match for each board position
    state.positions.forEach(p => {
      const match = calculateBestMatch(tiles, p.row, p.col);
      if (match !== null) {
        matches.push(match);
      }
    });

    // Sort matches by length so that we remove the better ones first
    matches.sort((a, b) => a.length < b.length)

    // Set new matches, sorted by length
    commit(types.SET_MATCHES, matches);
  },

  removeMatches({ commit, state }) {
    const tiles = deepCopy(state.tiles);

    // Change type of tiles to -1, indicating a removed tile
    for (let match of state.matches) {
      if (validMatch(match, tiles)) {
        match.forEach(v => { getTile(tiles, v.row, v.col).type = -1 });
      }
    }

    // Set our new tiles
    commit(types.SET_TILES, tiles);
  },

  setTileShifts({ commit, state }) {
    const positions = deepCopy(state.positions);
    const tiles = deepCopy(state.tiles);

    // Filter tiles for column start tiles
    const columnStartPositions = positions.filter(p => p.isColumnStart);

    // Set shifts for each tile in each column
    columnStartPositions.forEach(startPosition => {
      const emptyTiles = [];

      let shifts = [];
      let shiftLength = 0;

      // Set non-empty tile shifts, move empty tiles
      reverseIterate(startPosition, (curPosition) => {
        const { row, col, flowDirection } = curPosition;

        let tile = getTile(tiles, row, col);

        if (shiftLength > shifts.length) {
          shifts.unshift(flowDirection);
        } else if (shiftLength > 0 && shiftLength === shifts.length) {
          shifts.pop();
          shifts.unshift(flowDirection);
        }

        if (tile.type === -1) {
          // Increment shiftLength
          shiftLength += 1;

          // Add tile to the emptyTiles list
          emptyTiles.push(tile);
        } else {
          // Set tile shifts
          tile.shifts = shifts;
        }
      });

      // Set empty tile shifts
      const columnStartFeedDirection = getOppositeDirection(startPosition.feedDirection);
      // Tiles shifting from outside of the board need an extra shift
      shifts.unshift(columnStartFeedDirection);
      for (let i = 0; i < emptyTiles.length; i += 1) {
        shifts.unshift(columnStartFeedDirection);
        shifts.pop();
        emptyTiles[i].shifts = shifts;
      }
    });

    commit(types.SET_TILES, tiles);
  },

  setNewTiles({ commit, state }) {
    const tiles = deepCopy(state.tiles);

    // Filter tiles for new tiles
    const newTiles = tiles.filter(t => t.type === -1);

    newTiles.forEach(tile => {
      let { row, col, shifts } = tile;

      shifts.forEach(direction => {
        ({ row, col } = getNextCoordinatesFromDirection(row, col, getOppositeDirection(direction)));
      });

      tile.row = row;
      tile.col = col;
      tile.type = getRandomTileType(state.tileTypes);
    });

    commit(types.SET_TILES, tiles);
  },

  shiftTiles({ commit, state }, tiles) {
    tiles.forEach(tile => {
      const shift = tile.shifts.shift();

      let { row, col } = getNextCoordinatesFromDirection(tile.row, tile.col, shift);

      tile.row = row;
      tile.col = col;
    });

    commit(types.SET_TILES, tiles);
  },

  shiftTiless({ state, commit }) {
    const positions = deepCopy(state.positions);
    const tiles = deepCopy(state.tiles);

    // Filter tiles for column start tiles
    const columnStartPositions = positions.filter(p => p.isColumnStart);

    // Find shifts in each column and shift tiles appropriately, filling gaps with new tiles
    columnStartPositions.forEach(p => reverseIterate(p, { shift: 0 }, (row, col, data) => {
      let tile = getTile(tiles, row, col);
      if (tile.type === -1) {
        // Generate a random tile
        tile.type = getRandomTileType(state.tileTypes);

        // Move it 'above' it's start position
        const { row, col, feedDirection } = p;
        const { row: newRow, col: newCol } = getCoordinatesFromDirection(row, col, feedDirection);

        tile.row = newRow - data.shift;
        tile.col = newCol;

        // Increment shift
        data.shift += 1;
      } else if (data.shift > 0) {
        // Swap tile to shift it

        // TODO: figure out how to shift this piece. if it needs to shift 2
        // places, right and then down, we can calculate its row and col
        // offsets, and then do a straight tile swap using both offsets.
        // The problem is animating it.  If we want to animate it moving
        // right and then down, we need to first keep track of how it's
        // being swapped, and then maybe swap one at a time

        // TODO: Change to spawn new tiles (if we want to animate the tiles falling
        // into the board, we probably need to go back to having 'feed' tile positions)

        // This currently only works with 'DOWN' columns.
        swapTiles(tiles, row, col, row + data.shift, col);
      }

      return data;
    }));

    // Set our new tiles
    commit(types.SET_TILES, tiles);
  },

  findMoves({ state, commit }) {
    // Reset moves
    state.moves = [];

    // Find horizontal moves
    for (let row = 0; row < state.rows; row += 1) {
      for (let col = 0; col < state.cols - 1; col += 1) {
        // Swap, find matches, swap back
        swapTiles(row, col, row, col + 1);
        findMatches();
        swapTiles(row, col, row, col + 1);

        // Check if the swap made a match
        if (state.matches.length > 0) {
          // Found a valid move
          state.moves.push({ row1: row, col1: col, row2: row, col2: col + 1 });
        }
      }
    }

    // Find vertical moves
    for (let col = 0; col < state.cols; col += 1) {
      for (let row = 0; row < state.rows - 1; row += 1) {
        // Swap, find matches, swap back
        swapTiles(row, col, row + 1, col);
        findMatches();
        swapTiles(row, col, row + 1, col);

        // Check if the swap made a match
        if (state.matches.length > 0) {
          // Found a valid move
          state.moves.push({ row1: row, col1: col, row2: row + 1, col2: col });
        }
      }
    }

    // Reset matches
    state.matches = [];
  },

  tileTouch({ state, dispatch, commit }, tile) {
    const { selected, row, col } = state.selectedTile;
    const { row: newRow, col: newCol } = tile;

    // Check if the position is selectable
    if (!selected || row !== newRow || col !== newCol) {
      // Check if the position is a current neighbor
      if (validNeighbor(row, col, newRow, newCol)) {
        // Remove board selection
        commit(types.SET_SELECTED_TILE, { selected: false, row: null, col: null, neighbors: [] });

        // Swap the two positions
        commit(types.SWAP_TILES, { row1: row, col1: col, row2: newRow, col2: newCol });

        // Check for match(es)
        if (dispatch('findMatches') && state.matches.length > 0) {
          dispatch('resolveMatches');
        } else {
          // Swap back
          setTimeout(() =>
            commit(types.SWAP_TILES, { row1: row, col1: col, row2: newRow, col2: newCol })
          , TRANSITIONTIME);
        }

      } else {
        // Refresh our selected position
        const newNeighbors = getValidNeighbors(newRow, newCol);

        commit(types.SET_SELECTED_TILE, { selected: true, row: newRow, col: newCol, neighbors: newNeighbors });
      }
    } else {
      // Remove board selection
      commit(types.SET_SELECTED_TILE, { selected: false, row: null, col: null, neighbors: [] });
    }
  },
};

const mutations = {
  [types.INIT_POSITIONS](state, positions) {
    state.positions = positions;
  },

  [types.INIT_TILES](state, tiles) {
    state.tiles = tiles;
  },

  [types.SET_TILES](state, tiles) {
    state.tiles = tiles;
  },

  [types.SET_MOVES](state, moves) {
    state.moves = moves;
  },

  [types.SET_MATCHES](state, matches) {
    state.matches = matches;
  },

  [types.SET_SELECTED_TILE](state, { selected, row, col, neighbors }) {
    state.selectedTile = {
      ...state.selectedTile,
      selected,
      row,
      col,
      neighbors,
    };
  },

  [types.SWAP_TILES](state, { row1, col1, row2, col2 }) {
    const tiles = deepCopy(state.tiles);

    let tile1 = getTile(tiles, row1, col1);
    let tile2 = getTile(tiles, row2, col2);

    let { row: tempRow, col: tempCol } = tile1;
    tile1.row = tile2.row;
    tile1.col = tile2.col;
    tile2.row = tempRow;
    tile2.col = tempCol;

    state.tiles = tiles;
  },
};

// TODO: Deprecate
function swapTiles(tiles, row1, col1, row2, col2) {
  const indexOne = coordinatesToIndex({ row: row1, col: col1 });
  const indexTwo = coordinatesToIndex({ row: row2, col: col2 });
  const typeOne = tiles[indexOne];
  const typeTwo = tiles[indexTwo];

  tiles[indexOne] = typeTwo;
  tiles[indexTwo] = typeOne;
}

/*****************************************************************************/
/*         All of these functions should probably be pure functions.         */
/*****************************************************************************/

function getTile(tiles, row, col) {
  return tiles.find(t => t.row === row && t.col === col);
}

function getPosition(row, col) {
  return state.positions.find(p => p.row === row && p.col === col);
}

function getRandomTileType(tileTypes) {
  return random(tileTypes.length - 1);
}

function getNextPositionFromFlow(position) {
  const { row, col, flowDirection } = position;
  const { row: nextRow, col: nextCol } =
    getNextCoordinatesFromDirection(row, col, flowDirection, true);

  return getPosition(nextRow, nextCol);
}

function getNextPositionFromFeed(position) {
  const { row, col, feedDirection } = position;
  const { row: nextRow, col: nextCol } =
    getNextCoordinatesFromDirection(row, col, feedDirection, false);

  return getPosition(nextRow, nextCol);
}

function getNextCoordinatesFromDirection(row, col, direction, isFlow = true) {
  switch (direction) {
    case (DIRECTIONS.DOWN): return isFlow ? { row: row + 1, col } : { row: row - 1, col };
    case (DIRECTIONS.UP): return isFlow ? { row: row - 1, col } : { row: row + 1, col };
    case (DIRECTIONS.RIGHT): return isFlow ? { row, col: col + 1 } : { row, col: col - 1 };
    case (DIRECTIONS.LEFT): return isFlow ? { row, col: col - 1 } : { row, col: col + 1 };
    default: return { row, col };
  }
}

function getOppositeDirection(direction) {
  switch (direction) {
    case (DIRECTIONS.DOWN): return DIRECTIONS.UP;
    case (DIRECTIONS.UP): return DIRECTIONS.DOWN;
    case (DIRECTIONS.RIGHT): return DIRECTIONS.LEFT;
    case (DIRECTIONS.LEFT): return DIRECTIONS.RIGHT;
    default: return direction;
  }
}

function reverseIterate(position, func) {
  // Recurse until we're at the last position
  if (position.flowDirection !== 'NONE') {
    reverseIterate(getNextPositionFromFlow(position), func);
  }

  // Then do something with this position
  func(position);
}

function calculateBestMatch(tiles, row, col) {
  let match = null;

  // Lines are sorted by preference, so that the best match is found first
  const lines = getValidLines(row, col);

  if (lines.length > 0) {
    const type = getTile(tiles, row, col).type;

    // Loop through the lines
    lines.some(line => {
      // We have a match if for every index in the line the tile type is the same
      const hasMatch = line.every(v => getTile(tiles, v.row, v.col).type === type);

      if (hasMatch) {
        match = line;
      }

      // Return a match as soon as we find one
      return hasMatch;
    });
  }

  return match;
}

function getValidNeighbors(row, col) {
  const neighbors = [
    getCoordinatesFromDirection(row, col, DIRECTIONS.DOWN),
    getCoordinatesFromDirection(row, col, DIRECTIONS.UP),
    getCoordinatesFromDirection(row, col, DIRECTIONS.RIGHT),
    getCoordinatesFromDirection(row, col, DIRECTIONS.LEFT),
  ];
  return neighbors.filter(n => validNeighbor(row, col, n.row, n.col));
}

function validNeighbor(row1, col1, row2, col2) {
  return (
    withinBoard(row1, col1) && withinBoard(row2, col2) &&
    (Math.abs(row1 - row2) === 1 && col1 === col2) ||
    (Math.abs(col1 - col2) === 1 && row1 === row2)
  );
}

function getValidLines(row, col) {
  // Sorted by preference, so that the best match is found first
  const lines = [
    // 1x5 match
    [{ row, col }, { row, col: col + 1 }, { row, col: col + 2 }, { row, col: col + 3 }, { row, col: col + 4 }],
    // 5x1 match
    [{ row, col }, { row: row + 1, col }, { row: row + 2, col }, { row: row + 3, col }, { row: row + 4, col }],
    // 1x4 match
    [{ row, col }, { row, col: col + 1 }, { row, col: col + 2 }, { row, col: col + 3 }],
    // 4x1 match
    [{ row, col }, { row: row + 1, col }, { row: row + 2, col }, { row: row + 3, col }],
    // 2x2 match
    [{ row, col }, { row, col: col + 1 }, { row: row + 1, col: col + 1 }, { row: row + 1, col }],
    // 1x3 match
    [{ row, col }, { row, col: col + 1 }, { row, col: col + 2 }],
    // 3x1 match
    [{ row, col }, { row: row + 1, col }, { row: row + 2, col }],
  ];

  // Filter out lines that don't fit
  return lines.filter(line => line.every(v => withinBoard(v.row, v.col)));
}

function validMatch(match, tiles) {
  return match.every(i => getTile(tiles, i.row, i.col).type !== -1);
}

function withinBoard(row, col) {
  return (
    row >= 0 && row < state.rows &&
    col >= 0 && col < state.cols
  );
}

function coordinatesToIndex(pos) {
  return pos.row * state.cols + pos.col;
}

function indexToCoordinates(index) {
  const col = index % state.rows;
  const row = (index - col) / state.cols;
  return { row, col };
}

export default {
  state,
  getters,
  actions,
  mutations,
};
