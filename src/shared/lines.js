/* eslint-disable no-use-before-define */
import { POINTS, SPECIALS } from './constants';

export const defaultLineOptions = {
  painters: true,
  bombs: true,
  wrappeds: true,
  stripeds: true,
  fishes: true,
  normals: true,
};

// All lines
export const getLines = (row, col, lineOptions = defaultLineOptions) => {
  const { painters, bombs, wrappeds, stripeds, fishes, normals } = lineOptions;

  return [
    ...(painters ? getPainterLines(row, col) : []),
    ...(bombs ? getBombLines(row, col) : []),
    ...(wrappeds ? getWrappedLines(row, col) : []),
    ...(stripeds ? getStripedLines(row, col) : []),
    ...(fishes ? getFishLines(row, col) : []),
    ...(normals ? getNormalLines(row, col) : []),
  ];
};

// Lines: Priority 1: Color Painters
export const getPainterLines = (row, col) => [
  // Color Painter (Horizontal, pointing UP with 1 extra UP)
  {
    priority: 1,
    special: SPECIALS.PAINTER,
    bonusPoints: POINTS.PAINTER,
    positions: [
      { row, col },
      { row, col: col + 1 },
      { row, col: col + 2 },
      { row, col: col + 3 },
      { row, col: col + 4 },
      { row: row - 1, col: col + 2 },
      { row: row - 2, col: col + 2 },
    ],
  },
  // Color Painter (Horizontal, pointing DOWN with 1 extra DOWN)
  {
    priority: 1,
    special: SPECIALS.PAINTER,
    bonusPoints: POINTS.PAINTER,
    positions: [
      { row, col },
      { row, col: col + 1 },
      { row, col: col + 2 },
      { row, col: col + 3 },
      { row, col: col + 4 },
      { row: row + 1, col: col + 2 },
      { row: row + 2, col: col + 2 },
    ],
  },
  // Color Painter (Vertical, pointing LEFT with 1 extra LEFT)
  {
    priority: 1,
    special: SPECIALS.PAINTER,
    bonusPoints: POINTS.PAINTER,
    positions: [
      { row, col },
      { row: row + 1, col },
      { row: row + 2, col },
      { row: row + 3, col },
      { row: row + 4, col },
      { row: row + 2, col: col - 1 },
      { row: row + 2, col: col - 2 },
    ],
  },
  // Color Painter (Vertical, pointing RIGHT with 1 extra RIGHT)
  {
    priority: 1,
    special: SPECIALS.PAINTER,
    bonusPoints: POINTS.PAINTER,
    positions: [
      { row, col },
      { row: row + 1, col },
      { row: row + 2, col },
      { row: row + 3, col },
      { row: row + 4, col },
      { row: row + 2, col: col + 1 },
      { row: row + 2, col: col + 2 },
    ],
  },
  // Color Painter (Horizontal, pointing UP)
  {
    priority: 1,
    special: SPECIALS.PAINTER,
    bonusPoints: POINTS.PAINTER,
    positions: [
      { row, col },
      { row, col: col + 1 },
      { row, col: col + 2 },
      { row, col: col + 3 },
      { row, col: col + 4 },
      { row: row - 1, col: col + 2 },
    ],
  },
  // Color Painter (Horizontal, pointing DOWN)
  {
    priority: 1,
    special: SPECIALS.PAINTER,
    bonusPoints: POINTS.PAINTER,
    positions: [
      { row, col },
      { row, col: col + 1 },
      { row, col: col + 2 },
      { row, col: col + 3 },
      { row, col: col + 4 },
      { row: row + 1, col: col + 2 },
    ],
  },
  // Color Painter (Vertical, pointing LEFT)
  {
    priority: 1,
    special: SPECIALS.PAINTER,
    bonusPoints: POINTS.PAINTER,
    positions: [
      { row, col },
      { row: row + 1, col },
      { row: row + 2, col },
      { row: row + 3, col },
      { row: row + 4, col },
      { row: row + 2, col: col - 1 },
    ],
  },
  // Color Painter (Vertical, pointing RIGHT)
  {
    priority: 1,
    special: SPECIALS.PAINTER,
    bonusPoints: POINTS.PAINTER,
    positions: [
      { row, col },
      { row: row + 1, col },
      { row: row + 2, col },
      { row: row + 3, col },
      { row: row + 4, col },
      { row: row + 2, col: col + 1 },
    ],
  },
];

// Lines: Priority 2: Color Bombs
export const getBombLines = (row, col) => [
  // Color Bomb (Horizontal)
  {
    priority: 2,
    special: SPECIALS.BOMB,
    bonusPoints: POINTS.BOMB,
    positions: [
      { row, col },
      { row, col: col + 1 },
      { row, col: col + 2 },
      { row, col: col + 3 },
      { row, col: col + 4 },
    ],
  },
  // Color Bomb (Vertical)
  {
    priority: 2,
    special: SPECIALS.BOMB,
    bonusPoints: POINTS.BOMB,
    positions: [
      { row, col },
      { row: row + 1, col },
      { row: row + 2, col },
      { row: row + 3, col },
      { row: row + 4, col },
    ],
  },
];

// Lines: Priority 3: Wrapped
export const getWrappedLines = (row, col) => [
  // Wrapped Candy (Corner, pointing UP_LEFT)
  {
    priority: 3,
    special: SPECIALS.WRAPPED,
    bonusPoints: POINTS.WRAPPED,
    positions: [
      { row, col },
      { row: row - 1, col },
      { row: row - 2, col },
      { row, col: col - 1 },
      { row, col: col - 2 },
    ],
  },
  // Wrapped Candy (Corner, pointing UP_RIGHT)
  {
    priority: 3,
    special: SPECIALS.WRAPPED,
    bonusPoints: POINTS.WRAPPED,
    positions: [
      { row, col },
      { row: row - 1, col },
      { row: row - 2, col },
      { row, col: col + 1 },
      { row, col: col + 2 },
    ],
  },
  // Wrapped Candy (Corner, pointing DOWN_RIGHT)
  {
    priority: 3,
    special: SPECIALS.WRAPPED,
    bonusPoints: POINTS.WRAPPED,
    positions: [
      { row, col },
      { row: row + 1, col },
      { row: row + 2, col },
      { row, col: col + 1 },
      { row, col: col + 2 },
    ],
  },
  // Wrapped Candy (Corner, pointing DOWN_LEFT)
  {
    priority: 3,
    special: SPECIALS.WRAPPED,
    bonusPoints: POINTS.WRAPPED,
    positions: [
      { row, col },
      { row: row + 1, col },
      { row: row + 2, col },
      { row, col: col - 1 },
      { row, col: col - 2 },
    ],
  },
  // Wrapped Candy (Middle, pointing UP)
  {
    priority: 3,
    special: SPECIALS.WRAPPED,
    bonusPoints: POINTS.WRAPPED,
    positions: [
      { row, col: col - 1 },
      { row, col },
      { row, col: col + 1 },
      { row: row - 1, col },
      { row: row - 2, col },
    ],
  },
  // Wrapped Candy (Middle, pointing RIGHT)
  {
    priority: 3,
    special: SPECIALS.WRAPPED,
    bonusPoints: POINTS.WRAPPED,
    positions: [
      { row: row - 1, col },
      { row, col },
      { row: row + 1, col },
      { row, col: col + 1 },
      { row, col: col + 2 },
    ],
  },
  // Wrapped Candy (Middle, pointing DOWN)
  {
    priority: 3,
    special: SPECIALS.WRAPPED,
    bonusPoints: POINTS.WRAPPED,
    positions: [
      { row, col: col - 1 },
      { row, col },
      { row, col: col + 1 },
      { row: row + 1, col },
      { row: row + 2, col },
    ],
  },
  // Wrapped Candy (Middle, pointing LEFT)
  {
    priority: 3,
    special: SPECIALS.WRAPPED,
    bonusPoints: POINTS.WRAPPED,
    positions: [
      { row: row - 1, col },
      { row, col },
      { row: row + 1, col },
      { row, col: col - 1 },
      { row, col: col - 2 },
    ],
  },
];

// Lines: Priority 4: Striped
export const getStripedLines = (row, col) => [
  // Striped Candy (Horizontal)
  {
    priority: 4,
    special: SPECIALS.STRIPED_V,
    bonusPoints: POINTS.STRIPED,
    positions: [
      { row, col },
      { row, col: col + 1 },
      { row, col: col + 2 },
      { row, col: col + 3 },
    ],
  },
  // Striped Candy (Vertical)
  {
    priority: 4,
    special: SPECIALS.STRIPED_H,
    bonusPoints: POINTS.STRIPED,
    positions: [
      { row, col },
      { row: row + 1, col },
      { row: row + 2, col },
      { row: row + 3, col },
    ],
  },
];

// Lines: Priority 5: Fish
export const getFishLines = (row, col) => [
  // Fish (With 1 extra UP_LEFT)
  {
    priority: 5,
    special: SPECIALS.FISH,
    bonusPoints: POINTS.FISH,
    positions: [
      { row, col },
      { row, col: col + 1 },
      { row: row + 1, col: col + 1 },
      { row: row + 1, col },
      { row: row - 1, col },
    ],
  },
  // Fish (With 1 extra UP_RIGHT)
  {
    priority: 5,
    special: SPECIALS.FISH,
    bonusPoints: POINTS.FISH,
    positions: [
      { row, col },
      { row, col: col + 1 },
      { row: row + 1, col: col + 1 },
      { row: row + 1, col },
      { row: row - 1, col: col + 1 },
    ],
  },
  // Fish (With 1 extra RIGHT_UP)
  {
    priority: 5,
    special: SPECIALS.FISH,
    bonusPoints: POINTS.FISH,
    positions: [
      { row, col },
      { row, col: col + 1 },
      { row: row + 1, col: col + 1 },
      { row: row + 1, col },
      { row, col: col + 2 },
    ],
  },
  // Fish (With 1 extra RIGHT_DOWN)
  {
    priority: 5,
    special: SPECIALS.FISH,
    bonusPoints: POINTS.FISH,
    positions: [
      { row, col },
      { row, col: col + 1 },
      { row: row + 1, col: col + 1 },
      { row: row + 1, col },
      { row: row + 1, col: col + 2 },
    ],
  },
  // Fish (With 1 extra DOWN_RIGHT)
  {
    priority: 5,
    special: SPECIALS.FISH,
    bonusPoints: POINTS.FISH,
    positions: [
      { row, col },
      { row, col: col + 1 },
      { row: row + 1, col: col + 1 },
      { row: row + 1, col },
      { row: row + 2, col: col + 1 },
    ],
  },
  // Fish (With 1 extra DOWN_LEFT)
  {
    priority: 5,
    special: SPECIALS.FISH,
    bonusPoints: POINTS.FISH,
    positions: [
      { row, col },
      { row, col: col + 1 },
      { row: row + 1, col: col + 1 },
      { row: row + 1, col },
      { row: row + 2, col },
    ],
  },
  // Fish (With 1 extra LEFT_DOWN)
  {
    priority: 5,
    special: SPECIALS.FISH,
    bonusPoints: POINTS.FISH,
    positions: [
      { row, col },
      { row, col: col + 1 },
      { row: row + 1, col: col + 1 },
      { row: row + 1, col },
      { row: row + 1, col: col - 1 },
    ],
  },
  // Fish (With 1 extra LEFT_UP)
  {
    priority: 5,
    special: SPECIALS.FISH,
    bonusPoints: POINTS.FISH,
    positions: [
      { row, col },
      { row, col: col + 1 },
      { row: row + 1, col: col + 1 },
      { row: row + 1, col },
      { row, col: col - 1 },
    ],
  },
  // Fish (Normal)
  {
    priority: 5,
    special: SPECIALS.FISH,
    bonusPoints: POINTS.FISH,
    positions: [
      { row, col },
      { row, col: col + 1 },
      { row: row + 1, col: col + 1 },
      { row: row + 1, col },
    ],
  },
];

// Lines: Priority 9: Normal
export const getNormalLines = (row, col) => [
  // Normal (Horizontal)
  {
    priority: 9,
    special: SPECIALS.NONE,
    bonusPoints: POINTS.NONE,
    positions: [
      { row, col },
      { row, col: col + 1 },
      { row, col: col + 2 },
    ],
  },
  // Normal (Vertical)
  {
    priority: 9,
    special: SPECIALS.NONE,
    bonusPoints: POINTS.NONE,
    positions: [
      { row, col },
      { row: row + 1, col },
      { row: row + 2, col },
    ],
  },
];
