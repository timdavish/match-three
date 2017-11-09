
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

export const POINTS = {
  PAINTER: 200,
  BOMB: 150,
  WRAPPED: 125,
  STRIPED: 100,
  FISH: 100,
  TILE: 50,
  NONE: 0,
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
    STRIPED: 50,
  },
  WAITS: {
    SUGGESTION: 10000,
    THINK_MINIMUM: 500,
    THINK_MAXIMUM: 1000,
  },
};

export const SPECIALS = {
  PAINTER: 'PAINTER',
  BOMB: 'BOMB',
  WRAPPED: 'WRAPPED',
  STRIPED_H: 'STRIPED H',
  STRIPED_V: 'STRIPED V',
  FISH: 'FISH',
  NONE: '',
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
