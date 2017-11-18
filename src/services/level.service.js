/* eslint-disable */

import { generateUid } from '../shared/util';

import { BLOCKERS, CONDITIONS, DIRECTIONS, LEVEL_TYPES, SPECIALS, TILETYPES } from '../shared/constants';

export function level() {
  return {
    levelData: {
      id: 1,
      type: LEVEL_TYPES.SCORE,
      moveCount: 15,
      scoreGoals: { one: 5000, two: 7500, three: 10000 },
      highScore: 0,
    },
    boardData: {
      rows: 5,
      cols: 5,

      // { id, row, col, active: true, columnStart, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection, feedDirection }
      positions: straightDownPos,

      // { id, row, col, type, shifts }
      tiles: [
        // Row 1
        // { id: 1, row: 0, col: 0, type: 1, special: SPECIALS.NONE, shifts: [], removed: false },
        // { id: 2, row: 0, col: 1, type: 0, special: SPECIALS.STRIPED_V, shifts: [], removed: false },
        // { id: 3, row: 0, col: 2, type: 2, special: SPECIALS.STRIPED_H, shifts: [], removed: false },
        // // Row 2
        // { id: 4, row: 1, col: 0, type: 0, special: SPECIALS.NONE, shifts: [], removed: false },
        // { id: 5, row: 1, col: 1, type: 2, special: SPECIALS.NONE, shifts: [], removed: false },
        // { id: 6, row: 1, col: 2, type: 1, special: SPECIALS.NONE, shifts: [], removed: false },
        // // Row 3
        // { id: 7, row: 2, col: 0, type: 0, special: SPECIALS.WRAPPED, shifts: [], removed: false },
        // { id: 8, row: 2, col: 1, type: 1, special: SPECIALS.STRIPED_H, shifts: [], removed: false },
        // { id: 9, row: 2, col: 2, type: 2, special: SPECIALS.NONE, shifts: [], removed: false },
      ],

      tileTypes: [
        TILETYPES.RED,
        TILETYPES.ORANGE,
        TILETYPES.GREEN,
        // TILETYPES.BLUE,
        // TILETYPES.PURPLE,
        // TILETYPES.YELLOW,
      ],

      // null is default
      lineOptions: null,
    },
  };
}

// TODO: make a board where the middle row doesn't move, feeds from top & bottom,
// and middle row feeds from both directions

const smallPos = [
  { id: generateUid(), row: 0, col: 0, active: true, columnStart: true, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 0, col: 1, active: true, columnStart: true, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 0, col: 2, active: true, columnStart: true, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },

  { id: generateUid(), row: 1, col: 0, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 1, col: 1, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 1, col: 2, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },

  { id: generateUid(), row: 2, col: 0, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.NONE, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 2, col: 1, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.NONE, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 2, col: 2, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.NONE, feedDirection: DIRECTIONS.UP },

];

const interwovenPos = [
  // Row 1
  { id: generateUid(), row: 0, col: 0, active: true, columnStart: true, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 0, col: 1, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 0, col: 2, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 0, col: 3, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 0, col: 4, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.NONE, feedDirection: DIRECTIONS.LEFT },
  // Row 2
  { id: generateUid(), row: 1, col: 0, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.NONE, feedDirection: DIRECTIONS.RIGHT },
  { id: generateUid(), row: 1, col: 1, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.LEFT, feedDirection: DIRECTIONS.RIGHT },
  { id: generateUid(), row: 1, col: 2, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.LEFT, feedDirection: DIRECTIONS.RIGHT },
  { id: generateUid(), row: 1, col: 3, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.LEFT, feedDirection: DIRECTIONS.RIGHT },
  { id: generateUid(), row: 1, col: 4, active: true, columnStart: true, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.LEFT, feedDirection: DIRECTIONS.RIGHT },
  // Row 3
  { id: generateUid(), row: 2, col: 0, active: true, columnStart: true, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 2, col: 1, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 2, col: 2, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 2, col: 3, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 2, col: 4, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.NONE, feedDirection: DIRECTIONS.LEFT },
  // Row 4
  { id: generateUid(), row: 3, col: 0, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.NONE, feedDirection: DIRECTIONS.RIGHT },
  { id: generateUid(), row: 3, col: 1, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.LEFT, feedDirection: DIRECTIONS.RIGHT },
  { id: generateUid(), row: 3, col: 2, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.LEFT, feedDirection: DIRECTIONS.RIGHT },
  { id: generateUid(), row: 3, col: 3, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.LEFT, feedDirection: DIRECTIONS.RIGHT },
  { id: generateUid(), row: 3, col: 4, active: true, columnStart: true, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.LEFT, feedDirection: DIRECTIONS.RIGHT },
  // Row 5
  { id: generateUid(), row: 4, col: 0, active: true, columnStart: true, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 4, col: 1, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 4, col: 2, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 4, col: 3, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 4, col: 4, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.NONE, feedDirection: DIRECTIONS.LEFT },
];

const straightDownPos = [
  // Row 1
  { id: generateUid(), row: 0, col: 0, active: true, columnStart: true, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 0, col: 1, active: true, columnStart: true, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 0, col: 2, active: true, columnStart: true, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 0, col: 3, active: true, columnStart: true, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 0, col: 4, active: true, columnStart: true, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  // Row 2
  { id: generateUid(), row: 1, col: 0, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 1, col: 1, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 1, col: 2, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 1, col: 3, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 1, col: 4, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  // Row 3
  { id: generateUid(), row: 2, col: 0, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 2, col: 1, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 2, col: 2, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 2, col: 3, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 2, col: 4, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  // Row 4
  { id: generateUid(), row: 3, col: 0, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 3, col: 1, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 3, col: 2, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 3, col: 3, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 3, col: 4, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  // Row 5
  { id: generateUid(), row: 4, col: 0, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.NONE, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 4, col: 1, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.NONE, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 4, col: 2, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.NONE, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 4, col: 3, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.NONE, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 4, col: 4, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.NONE, feedDirection: DIRECTIONS.UP },
];

const spiralPos = [
  // In order
  { id: generateUid(), row: 0, col: 0, active: true, columnStart: true, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 1, col: 0, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 2, col: 0, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 3, col: 0, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 4, col: 0, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 4, col: 1, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 4, col: 2, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 4, col: 3, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 4, col: 4, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.UP, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 3, col: 4, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.UP, feedDirection: DIRECTIONS.DOWN },
  { id: generateUid(), row: 2, col: 4, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.UP, feedDirection: DIRECTIONS.DOWN },
  { id: generateUid(), row: 1, col: 4, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.UP, feedDirection: DIRECTIONS.DOWN },
  { id: generateUid(), row: 0, col: 4, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.LEFT, feedDirection: DIRECTIONS.DOWN },
  { id: generateUid(), row: 0, col: 3, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.LEFT, feedDirection: DIRECTIONS.RIGHT },
  { id: generateUid(), row: 0, col: 2, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.LEFT, feedDirection: DIRECTIONS.RIGHT },
  { id: generateUid(), row: 0, col: 1, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.RIGHT },
  { id: generateUid(), row: 1, col: 1, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 2, col: 1, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 3, col: 1, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 3, col: 2, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 3, col: 3, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.UP, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 2, col: 3, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.UP, feedDirection: DIRECTIONS.DOWN },
  { id: generateUid(), row: 1, col: 3, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.LEFT, feedDirection: DIRECTIONS.DOWN },
  { id: generateUid(), row: 1, col: 2, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.RIGHT },
  { id: generateUid(), row: 2, col: 2, active: true, columnStart: false, blocker: BLOCKERS.NONE, condition: CONDITIONS.NONE, flowDirection: DIRECTIONS.NONE, feedDirection: DIRECTIONS.UP },
];
