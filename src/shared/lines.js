/* eslint-disable no-use-before-define */
import { POINTS, PRIORITIES, SPECIALS } from './constants';

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

// Lines: Color Painters
export const getPainterLines = (row, col) => [
  // Color Painter (Horizontal, pointing UP with 1 extra UP)
  {
    priority: PRIORITIES.PAINTER,
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
    priority: PRIORITIES.PAINTER,
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
    priority: PRIORITIES.PAINTER,
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
    priority: PRIORITIES.PAINTER,
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
    priority: PRIORITIES.PAINTER,
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
    priority: PRIORITIES.PAINTER,
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
    priority: PRIORITIES.PAINTER,
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
    priority: PRIORITIES.PAINTER,
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

// Lines: Color Bombs
export const getBombLines = (row, col) => [
  // Color Bomb (Horizontal)
  {
    priority: PRIORITIES.BOMB,
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
    priority: PRIORITIES.BOMB,
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

// Lines: Wrapped
export const getWrappedLines = (row, col) => [
  // Wrapped Candy (Corner, pointing UP_LEFT)
  {
    priority: PRIORITIES.WRAPPED,
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
    priority: PRIORITIES.WRAPPED,
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
    priority: PRIORITIES.WRAPPED,
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
    priority: PRIORITIES.WRAPPED,
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
    priority: PRIORITIES.WRAPPED,
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
    priority: PRIORITIES.WRAPPED,
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
    priority: PRIORITIES.WRAPPED,
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
    priority: PRIORITIES.WRAPPED,
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

// Lines: Striped
export const getStripedLines = (row, col) => [
  // Striped Candy (Horizontal)
  {
    priority: PRIORITIES.STRIPED,
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
    priority: PRIORITIES.STRIPED,
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

// Lines: Fish
export const getFishLines = (row, col) => [
  // Fish (With 1 extra UP_LEFT)
  {
    priority: PRIORITIES.FISH,
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
    priority: PRIORITIES.FISH,
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
    priority: PRIORITIES.FISH,
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
    priority: PRIORITIES.FISH,
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
    priority: PRIORITIES.FISH,
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
    priority: PRIORITIES.FISH,
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
    priority: PRIORITIES.FISH,
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
    priority: PRIORITIES.FISH,
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
    priority: PRIORITIES.FISH,
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

// Lines: Normal
export const getNormalLines = (row, col) => [
  // Normal (Horizontal)
  {
    priority: PRIORITIES.NONE,
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
    priority: PRIORITIES.NONE,
    special: SPECIALS.NONE,
    bonusPoints: POINTS.NONE,
    positions: [
      { row, col },
      { row: row + 1, col },
      { row: row + 2, col },
    ],
  },
];
