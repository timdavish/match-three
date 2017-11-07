/* eslint-disable no-param-reassign */
export const UPDATE_CURRENT_SCORE = (state, score) => {
  state.currentScore = score;
};

export const UPDATE_HIGH_SCORE = (state, score) => {
  state.highScore = score;
};

export const UPDATE_MOVE_COUNT = (state, moves) => {
  state.moveCount = moves;
};
