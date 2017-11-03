
export const ANIMATION_TIMES = {
  // General animations
  REMOVE: 75,
  SHIFT: 250,
  SHUFFLE: 700,
  SWAP: 250,
  // Special animations
  STRIPED: 50,
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

export const TILETYPES = {
  BLUE: 'BLUE',
  GREEN: 'GREEN',
  ORANGE: 'ORANGE',
  PURPLE: 'PURPLE',
  RED: 'RED',
  YELLOW: 'YELLOW',
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
