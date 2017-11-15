
// Numbers represent the layer count
export const BLOCKERS = {
  // Chocolate
  DARK1: 'DARK1',
  WHITE1: 'WHITE1',
  WHITE2: 'WHITE2',
  // Cupcake
  CUPCAKE1: 'CUPCAKE1',
  CUPCAKE2: 'CUPCAKE2',
  CUPCAKE3: 'CUPCAKE3',
  CUPCAKE4: 'CUPCAKE4',
  CUPCAKE5: 'CUPCAKE5',
  // Gum
  GUM1: 'GUM1',
  GUM2: 'GUM2',
  // Honey
  HONEY1: 'HONEY1',
  HONEY2: 'HONEY2',
  HONEY3: 'HONEY3',
  HONEY4: 'HONEY4',
  HONEY5: 'HONEY5',
  HONEY6: 'HONEY6',
  // Ice
  ICE1: 'ICE1',
  ICE2: 'ICE2',
  ICE3: 'ICE3',
  ICE4: 'ICE4',
  ICE5: 'ICE5',
  ICE6: 'ICE6',
  NONE: 'NONE',
};

// Numbers represent the layer count
export const CONDITIONS = {
  // Frosting
  FROSTING1: 'FROSTING1',
  FROSTING2: 'FROSTING2',
  // Jam
  JAM: 'JAM',
  NONE: 'NONE',
};

export const DIRECTIONS = {
  UP_LEFT: 'UP_LEFT',
  UP: 'UP',
  UP_RIGHT: 'UP_RIGHT',
  RIGHT: 'RIGHT',
  DOWN_RIGHT: 'DOWN_RIGHT',
  DOWN: 'DOWN',
  DOWN_LEFT: 'DOWN_LEFT',
  LEFT: 'LEFT',
  NONE: 'NONE',
};

export const LEVEL_TYPES = {
  CHOCOLATE: 'CHOCOLATE',
  FROSTING: 'FROSTING',
  GUM: 'GUM',
  HONEY: 'HONEY',
  JAM: 'JAM',
  SODA: 'SODA',
  SCORE: 'SCORE',
};

export const POINTS = {
  PAINTER: 200,
  BOMB: 150,
  WRAPPED: 125,
  STRIPED: 100,
  FISH: 100,
  TILE: 50,
  NONE: 0,
};

export const PRIORITIES = {
  PAINTER: 1,
  BOMB: 2,
  WRAPPED: 3,
  STRIPED: 4,
  FISH: 5,
  NONE: 9,
};

export const TILETYPES = {
  BLUE: 'BLUE',
  GREEN: 'GREEN',
  ORANGE: 'ORANGE',
  PURPLE: 'PURPLE',
  RED: 'RED',
  YELLOW: 'YELLOW',
};

export const TIMES = {
  ANIMATIONS: {
    // General animations
    REMOVE: 100,
    SHIFT: 250,
    SHUFFLE: 700,
    SWAP: 300,
    // Special animations
    BOMB_MAXIMUM: 1250,
    BOMB_MINIMUM: 750,
    WRAPPED: 100,
    STRIPED: 100,
    FISH: 100,
  },
  WAITS: {
    SUGGESTION: 10000,
    THINK_MAXIMUM: 1000,
    THINK_MINIMUM: 500,
  },
};

export const SPECIALS = {
  // Creatable
  PAINTER: 'PAINTER',
  BOMB: 'BOMB',
  WRAPPED: 'WRAPPED',
  WRAPPED_EXPLODED: 'WRAPPED_EXPLODED',
  STRIPED_H: 'STRIPED H',
  STRIPED_V: 'STRIPED V',
  FISH: 'FISH',
  NONE: 'NONE',
  // Not Creatable
  SODA: 'SODA',
};

export const STATUS = {
  BUSY: 'BUSY',
  IDLE: 'IDLE',
};

export const VECTORS = {
  UP_LEFT: { row: -1, col: -1 },
  UP: { row: -1, col: 0 },
  UP_RIGHT: { row: -1, col: 1 },
  RIGHT: { row: 0, col: 1 },
  DOWN_RIGHT: { row: 1, col: 1 },
  DOWN: { row: 1, col: 0 },
  DOWN_LEFT: { row: 1, col: -1 },
  LEFT: { row: 0, col: -1 },
  NONE: { row: 0, col: 0 },
};
