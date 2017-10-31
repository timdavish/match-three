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
  tileTypes: [TILETYPES.BLUE, TILETYPES.GREEN, TILETYPES.ORANGE, TILETYPES.PURPLE, TILETYPES.RED, TILETYPES.YELLOW],

  // { index, flowDirection, feedDirection, isColumnStart }
  positions: [],

  // type
  tiles: [],

  // { row1, col1, row2, col2 }
  moves: [],

  // [indices]
  matches: [],

  selectedTile: { selected: false, index: -10, neighbors: [] },
};

const getters = {
  id: state => state.id,
  type: state => state.type,
  moveCount: state => state.moveCount,
  scores: state => state.scores,
  score: state => state.score,

  positions: state => state.positions,
  tiles: state => state.tiles,
  tileTypes: state => state.tileTypes,

  selected: state => state.selectedTile,
};

const actions = {
  init({ dispatch }) {
    // Set up board positions and tiles
    dispatch('initBoard');

    // Fill the board with random tiles
    dispatch('fillBoard');
  },

  initBoard({ state, commit }) {
    const positions = deepCopy(state.positions);
    const tiles = deepCopy(state.tiles);
    const rows = state.rows;
    const cols = state.cols;

    for (let i = 0; i < rows * cols; i += 1) {
      let position = { index: i, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP, isColumnStart: false };
      let tile = { id: i, type: -1 };

      if (i < cols) {
        // First row
        position = {
          ...position,
          isColumnStart: true,
        };
      } else if (i >= rows * cols - cols) {
        // Last row
        position = {
          ...position,
          flowDirection: DIRECTIONS.NONE,
        };
      }

      positions[i] = position;
      tiles[i] = tile;
    }

    commit(types.SET_POSITIONS, positions);
    commit(types.SET_TILES, tiles);
  },

  fillBoard({ state, dispatch, commit }) {
    let tiles = deepCopy(state.tiles);

    let done = false;
    while (!done) {
      // Fill the board with random tiles
      for (let i = 0; i < state.rows * state.cols; i += 1) {
        tiles[i].type = getRandomTile();
      }

      // Set our newly generated tiles
      commit(types.SET_TILES, tiles);

      // Resolve any matches
      dispatch('resolveMatches');

      // Check if there are valid moves
      // dispatch('findMoves');

      // Done if there is at least one valid move
      // if (state.moves.length > 0) {
      // done = true;
      // }
      done = true;
    }
  },

  resolveMatches({ state, dispatch, commit }) {
    // Check for matches
    dispatch('findMatches');

    // Get rid of any matches
    while (state.matches.length > 0) {
      // Remove matches
      dispatch('removeMatches');

      // Shift tiles, waiting for remove animation
      // setTimeout(() => dispatch('shiftTiles'), 100);
      dispatch('shiftTiles');

      // Check for newly created matches, waiting for shift animation
      // setTimeout(() => dispatch('findMatches'), 1500);
      dispatch('findMatches');
    }
  },

  findMatches({ state, commit }) {
    // Reset matches
    const matches = [];
    const rows = state.rows;
    const cols = state.cols;

    for (let i = 0; i < rows * cols; i += 1) {
      const match = calculateBestMatch(i);
      if (match !== null) {
        matches.push(match);
      }
    }

    // Sort matches by length so that we remove the better ones first
    matches.sort((a, b) => a.length < b.length)

    // Set new matches, sorted by length
    commit(types.SET_MATCHES, matches);
  },

  removeMatches({ state, commit }) {
    const tiles = deepCopy(state.tiles);

    // Change type of tiles to -1, indicating a removed tile
    for (let match of state.matches) {
      if (validMatch(match, tiles)) {
        match.forEach(i => { tiles[i].type = -1 });
      }
    }

    // Set our new tiles
    commit(types.SET_TILES, tiles);
  },

  shiftTiles({ state, commit }) {
    const positions = deepCopy(state.positions);
    const tiles = deepCopy(state.tiles);

    // Filter tiles for column start tiles
    const columnStartPositions = positions.filter(p => p.isColumnStart);

    // Find shifts in each column and shift tiles appropriately, filling gaps with new tiles
    columnStartPositions.forEach(p => reverseIterate(p, { shift: 0 }, (index, data) => {
      if (tiles[index].type === -1) {
        // Generate a random tile
        tiles[index].type = getRandomTile();

        // Increment shift
        data.shift += 1;
      } else if (data.shift > 0) {
        // Swap tile to shift it
        const { row, col } = indexToCoordinates(index);

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

  tileTouch({ state, dispatch, commit }, newIndex) {
    const { selected, index, neighbors } = state.selectedTile;

    // Check if the position is selectable
    if (!selected || index !== newIndex) {
      // Check if the position is a current neighbor
      if (validNeighbor(index, newIndex)) {
        // Remove board selection
        commit(types.SET_SELECTED_TILE, { selected: false, index: -10, neighbors: [] });

        // Swap the two positions
        commit(types.SWAP_TILES, { index1: index, index2: newIndex });

        // Check for match(es)
        if (dispatch('findMatches') && state.matches.length > 0) {
          dispatch('resolveMatches');
        } else {
          // Swap back
          setTimeout(() =>
            commit(types.SWAP_TILES, { index1: index, index2: newIndex })
          , 1500);
        }

      } else {
        // Refresh our selected position
        const newNeighbors = getValidNeighbors(newIndex);

        commit(types.SET_SELECTED_TILE, { selected: true, index: newIndex, neighbors: newNeighbors });
      }
    } else {
      // Remove board selection
      commit(types.SET_SELECTED_TILE, { selected: false, index: -10, neighbors: [] });
    }
  },
};

const mutations = {
  [types.SET_POSITIONS](state, positions) {
    state.positions = positions;
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

  [types.SET_SELECTED_TILE](state, { selected, index, neighbors }) {
    state.selectedTile = {
      ...state.selectedTile,
      selected,
      index,
      neighbors,
    };
  },

  [types.SWAP_TILES](state, { index1, index2 }) {
    const tiles = deepCopy(state.tiles);

    let temp = tiles[index1];
    tiles[index1] = tiles[index2];
    tiles[index2] = temp;

    state.tiles = tiles;

    // const tile1 = tiles[index1];
    // const tile2 = tiles[index2];
    //
    // tiles[index2] = tile1;
    // tiles[index1] = tile2;
    // state.tiles = tiles;
    // state.tiles.splice(index1, 1, tile2);
    // state.tiles.splice(index2, 1, tile1);
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
// All of these functions should probably be pure functions

function getRandomTile() {
  return random(state.tileTypes.length - 1);
}

function getIndexFromDirection(index, direction) {
  switch (direction) {
    case (DIRECTIONS.DOWN): return index + state.cols;
    case (DIRECTIONS.UP): return index - state.cols;
    case (DIRECTIONS.RIGHT): return index + 1;
    case (DIRECTIONS.LEFT): return index - 1;
    default: return index;
  }
}

function getValidNeighbors(index) {
  const neighbors = [
    getIndexFromDirection(index, DIRECTIONS.DOWN),
    getIndexFromDirection(index, DIRECTIONS.UP),
    getIndexFromDirection(index, DIRECTIONS.RIGHT),
    getIndexFromDirection(index, DIRECTIONS.LEFT),
  ];
  return neighbors.filter(n => validNeighbor(index, n));
}

function validNeighbor(index1, index2) {
  const { row: row1, col: col1 } = indexToCoordinates(index1);
  const { row: row2, col: col2 } = indexToCoordinates(index2);
  return (
    withinBoard(index1) && withinBoard(index2) &&
    (Math.abs(row1 - row2) === 1 && col1 === col2) ||
    (Math.abs(col1 - col2) === 1 && row1 === row2)
  );
}

function withinBoard(index) {
  const { row, col } = indexToCoordinates(index);
  return (
    row >= 0 && row < state.rows &&
    col >= 0 && col < state.cols
  );
}

function indexToCoordinates(index) {
  const col = index % state.rows;
  const row = (index - col) / state.cols;
  return { row, col };
}

function coordinatesToIndex(pos) {
  return pos.row * state.cols + pos.col;
}

function reverseIterate(position, data, func) {
  const { index, flowDirection } = position;

  // Recurse until we're at the last position
  if (flowDirection !== 'NONE') {
    const nextIndex = getIndexFromDirection(index, flowDirection);
    reverseIterate(state.positions[nextIndex], data, func);
  }

  // Then do something with this position
  return func(index, data);
}

function calculateBestMatch(index) {
  // Lines are sorted by preference, so that the best match is found first
  const lines = getValidLines(index);
  const type = state.tiles[index].type;

  let match = null;

  // Loop through the lines
  lines.some(line => {
    // We have a match if for every index in the line the tile type is the same
    const hasMatch = line.every(i => state.tiles[i].type === type);

    if (hasMatch) {
      match = line;
    }

    // Return a match as soon as we find one, since it will be the best one possible
    return hasMatch;
  });

  return match;
}

function getValidLines(index) {
  // Sorted by preference, so that the best match is found first
  const lines = [
    // 1x5 match
    [index, index + 1, index + 2, index + 3, index + 4],
    // 5x1 match
    [index, index + state.cols, index + 2 * state.cols, index + 3 * state.cols, index + 4 * state.cols],
    // 1x4 match
    [index, index + 1, index + 2, index + 3],
    // 4x1 match
    [index, index + state.cols, index + 2 * state.cols, index + 3 * state.cols],
    // 2x2 match
    [index, index + 1, index + state.cols + 1, index + state.cols],
    // 1x3 match
    [index, index + 1, index + 2],
    // 3x1 match
    [index, index + state.cols, index + 2 * state.cols],
  ];

  // Filter out lines that don't fit
  return lines.filter(line => line.every((v, i, arr) => v === index || validNeighbor(v, arr[i - 1])));
}

function validMatch(match, tiles) {
  return match.every(i => tiles[i].type !== -1);
}

export default {
  state,
  getters,
  actions,
  mutations,
};
