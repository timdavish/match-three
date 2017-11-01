/* eslint-disable */

import { generateUid } from '../util/util';

import { DIRECTIONS, TILETYPES } from '../shared/constants';

export function level() {
  return {
    levelData: {
      id: 1,
      type: 'SCORE',
      moveCount: 15,
      scoreGoals: { one: 10, two: 20, three: 30 },
      highScore: 100,
    },
    boardData: {
      rows: 5,
      cols: 5,

      // { id, row, col, isActive: true, isFrozen: false, isColumnStart, flowDirection, feedDirection }
      positions: straightDownPos,

      // { id, row, col, type, shifts }
      tiles: [
        // Row 1
        // { id: 1, row: 0, col: 0, type: 1, shifts: [] },
        // { id: 2, row: 0, col: 1, type: 2, shifts: [] },
        // { id: 3, row: 0, col: 2, type: 0, shifts: [] },
        // // Row 2
        // { id: 4, row: 1, col: 0, type: 0, shifts: [] },
        // { id: 5, row: 1, col: 1, type: 2, shifts: [] },
        // { id: 6, row: 1, col: 2, type: 1, shifts: [] },
        // // Row 3
        // { id: 7, row: 2, col: 0, type: 0, shifts: [] },
        // { id: 8, row: 2, col: 1, type: 1, shifts: [] },
        // { id: 9, row: 2, col: 2, type: 2, shifts: [] },
      ],

      tileTypes: [
        TILETYPES.BLUE,
        TILETYPES.GREEN,
        TILETYPES.ORANGE,
        // TILETYPES.PURPLE,
        // TILETYPES.RED,
        // TILETYPES.YELLOW,
      ],
    },
  };
}

// TODO: make a board where the middle row doesn't move, feeds from top & bottom,
// and middle row feeds from both directions

const interwovenPos = [
  // Row 1
  { id: generateUid(), row: 0, col: 0, isActive: true, isFrozen: false, isColumnStart: true, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 0, col: 1, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 0, col: 2, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 0, col: 3, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 0, col: 4, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.NONE, feedDirection: DIRECTIONS.LEFT },
  // Row 2
  { id: generateUid(), row: 1, col: 0, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.NONE, feedDirection: DIRECTIONS.RIGHT },
  { id: generateUid(), row: 1, col: 1, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.LEFT, feedDirection: DIRECTIONS.RIGHT },
  { id: generateUid(), row: 1, col: 2, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.LEFT, feedDirection: DIRECTIONS.RIGHT },
  { id: generateUid(), row: 1, col: 3, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.LEFT, feedDirection: DIRECTIONS.RIGHT },
  { id: generateUid(), row: 1, col: 4, isActive: true, isFrozen: false, isColumnStart: true, flowDirection: DIRECTIONS.LEFT, feedDirection: DIRECTIONS.RIGHT },
  // Row 3
  { id: generateUid(), row: 2, col: 0, isActive: true, isFrozen: false, isColumnStart: true, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 2, col: 1, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 2, col: 2, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 2, col: 3, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 2, col: 4, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.NONE, feedDirection: DIRECTIONS.LEFT },
  // Row 4
  { id: generateUid(), row: 3, col: 0, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.NONE, feedDirection: DIRECTIONS.RIGHT },
  { id: generateUid(), row: 3, col: 1, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.LEFT, feedDirection: DIRECTIONS.RIGHT },
  { id: generateUid(), row: 3, col: 2, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.LEFT, feedDirection: DIRECTIONS.RIGHT },
  { id: generateUid(), row: 3, col: 3, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.LEFT, feedDirection: DIRECTIONS.RIGHT },
  { id: generateUid(), row: 3, col: 4, isActive: true, isFrozen: false, isColumnStart: true, flowDirection: DIRECTIONS.LEFT, feedDirection: DIRECTIONS.RIGHT },
  // Row 5
  { id: generateUid(), row: 4, col: 0, isActive: true, isFrozen: false, isColumnStart: true, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 4, col: 1, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 4, col: 2, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 4, col: 3, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 4, col: 4, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.NONE, feedDirection: DIRECTIONS.LEFT },
];

const straightDownPos = [
  // Row 1
  { id: generateUid(), row: 0, col: 0, isActive: true, isFrozen: false, isColumnStart: true, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 0, col: 1, isActive: true, isFrozen: false, isColumnStart: true, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 0, col: 2, isActive: true, isFrozen: false, isColumnStart: true, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 0, col: 3, isActive: true, isFrozen: false, isColumnStart: true, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 0, col: 4, isActive: true, isFrozen: false, isColumnStart: true, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  // Row 2
  { id: generateUid(), row: 1, col: 0, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 1, col: 1, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 1, col: 2, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 1, col: 3, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 1, col: 4, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  // Row 3
  { id: generateUid(), row: 2, col: 0, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 2, col: 1, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 2, col: 2, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 2, col: 3, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 2, col: 4, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  // Row 4
  { id: generateUid(), row: 3, col: 0, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 3, col: 1, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 3, col: 2, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 3, col: 3, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 3, col: 4, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  // Row 5
  { id: generateUid(), row: 4, col: 0, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.NONE, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 4, col: 1, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.NONE, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 4, col: 2, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.NONE, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 4, col: 3, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.NONE, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 4, col: 4, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.NONE, feedDirection: DIRECTIONS.UP },
];

const spiralPos = [
  // In order
  { id: generateUid(), row: 0, col: 0, isActive: true, isFrozen: false, isColumnStart: true, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 1, col: 0, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 2, col: 0, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 3, col: 0, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 4, col: 0, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 4, col: 1, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 4, col: 2, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 4, col: 3, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 4, col: 4, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.UP, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 3, col: 4, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.UP, feedDirection: DIRECTIONS.DOWN },
  { id: generateUid(), row: 2, col: 4, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.UP, feedDirection: DIRECTIONS.DOWN },
  { id: generateUid(), row: 1, col: 4, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.UP, feedDirection: DIRECTIONS.DOWN },
  { id: generateUid(), row: 0, col: 4, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.LEFT, feedDirection: DIRECTIONS.DOWN },
  { id: generateUid(), row: 0, col: 3, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.LEFT, feedDirection: DIRECTIONS.RIGHT },
  { id: generateUid(), row: 0, col: 2, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.LEFT, feedDirection: DIRECTIONS.RIGHT },
  { id: generateUid(), row: 0, col: 1, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.RIGHT },
  { id: generateUid(), row: 1, col: 1, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 2, col: 1, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 3, col: 1, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.UP },
  { id: generateUid(), row: 3, col: 2, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.RIGHT, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 3, col: 3, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.UP, feedDirection: DIRECTIONS.LEFT },
  { id: generateUid(), row: 2, col: 3, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.UP, feedDirection: DIRECTIONS.DOWN },
  { id: generateUid(), row: 1, col: 3, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.LEFT, feedDirection: DIRECTIONS.DOWN },
  { id: generateUid(), row: 1, col: 2, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.DOWN, feedDirection: DIRECTIONS.RIGHT },
  { id: generateUid(), row: 2, col: 2, isActive: true, isFrozen: false, isColumnStart: false, flowDirection: DIRECTIONS.NONE, feedDirection: DIRECTIONS.UP },
];
