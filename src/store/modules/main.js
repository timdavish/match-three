import * as types from '../mutation-types';

/* eslint-disable */
const state = {
  boardSize: 7,
  id: 1,
  type: 'SCORE',
  moves: 15,
  scores: { one: 10, two: 20, three: 30 },
  score: 0,

  appState: 'IDLE',

  boardData: {
    pieceTypes: ['SQUARE', 'TRIANGLE', 'CIRCLE'],
    boardPositions: [
      { isActive: false, isFeed: true }, { isActive: true, isFeed: true, flowDirection: 'DOWN' }, { isActive: true, isFeed: true, flowDirection: 'DOWN' }, { isActive: true, isFeed: true, flowDirection: 'DOWN' }, { isActive: true, isFeed: true, flowDirection: 'DOWN' }, { isActive: true, isFeed: true, flowDirection: 'DOWN' }, { isActive: false, isFeed: true }, // eslint-disable-line
      { isActive: false, isFeed: true }, { isActive: true, isFeed: false, feedDirections: ['UP'], flowDirection: 'DOWN' }, { isActive: true, isFeed: false, feedDirections: ['UP'], flowDirection: 'DOWN' }, { isActive: true, isFeed: false, feedDirections: ['UP'], flowDirection: 'DOWN' }, { isActive: true, isFeed: false, feedDirections: ['UP'], flowDirection: 'DOWN' }, { isActive: true, isFeed: false, feedDirections: ['UP'], flowDirection: 'DOWN' }, { isActive: false, isFeed: true }, // eslint-disable-line
      { isActive: false, isFeed: true }, { isActive: true, isFeed: false, feedDirections: ['UP'], flowDirection: 'DOWN' }, { isActive: true, isFeed: false, feedDirections: ['UP'], flowDirection: 'DOWN' }, { isActive: true, isFeed: false, feedDirections: ['UP'], flowDirection: 'DOWN' }, { isActive: true, isFeed: false, feedDirections: ['UP'], flowDirection: 'DOWN' }, { isActive: true, isFeed: false, feedDirections: ['UP'], flowDirection: 'DOWN' }, { isActive: false, isFeed: true }, // eslint-disable-line
      { isActive: false, isFeed: true }, { isActive: true, isFeed: false, feedDirections: ['UP'], flowDirection: 'DOWN' }, { isActive: true, isFeed: false, feedDirections: ['UP'], flowDirection: 'DOWN' }, { isActive: true, isFeed: false, feedDirections: ['UP'], flowDirection: 'DOWN' }, { isActive: true, isFeed: false, feedDirections: ['UP'], flowDirection: 'DOWN' }, { isActive: true, isFeed: false, feedDirections: ['UP'], flowDirection: 'DOWN' }, { isActive: false, isFeed: true }, // eslint-disable-line
      { isActive: false, isFeed: true }, { isActive: true, isFeed: false, feedDirections: ['UP'], flowDirection: 'DOWN' }, { isActive: true, isFeed: false, feedDirections: ['UP'], flowDirection: 'DOWN' }, { isActive: true, isFeed: false, feedDirections: ['UP'], flowDirection: 'DOWN' }, { isActive: true, isFeed: false, feedDirections: ['UP'], flowDirection: 'DOWN' }, { isActive: true, isFeed: false, feedDirections: ['UP'], flowDirection: 'DOWN' }, { isActive: false, isFeed: true }, // eslint-disable-line
      { isActive: false, isFeed: true }, { isActive: true, isFeed: false, feedDirections: ['UP'], flowDirection: 'DOWN' }, { isActive: true, isFeed: false, feedDirections: ['UP'], flowDirection: 'DOWN' }, { isActive: true, isFeed: false, feedDirections: ['UP'], flowDirection: 'DOWN' }, { isActive: true, isFeed: false, feedDirections: ['UP'], flowDirection: 'DOWN' }, { isActive: true, isFeed: false, feedDirections: ['UP'], flowDirection: 'DOWN' }, { isActive: false, isFeed: true }, // eslint-disable-line
      { isActive: false, isFeed: true }, { isActive: false, isFeed: true }, { isActive: false, isFeed: true }, { isActive: false, isFeed: true }, { isActive: false, isFeed: true }, { isActive: false, isFeed: true }, { isActive: false, isFeed: true }, // eslint-disable-line
    ].map((pos, index) => { pos.id = index; return pos; }),
  },

  pieces: Array.from({ length: 49 }, (val, index) => {
    return {
      id: index,
      val: filterFeeds(index, 7) ? null : -1,
      // val: filterFeeds(index, 7) ? Math.floor(Math.random() * 3) : null,
    };
  }),

  boardSelected: {
    index: null,
    neighbors: [],
  },
};

const getters = {
  levelId: state => state.id,
  levelType: state => state.type,
  levelMoves: state => state.moves,
  levelScores: state => state.scores,
  currentScore: state => state.score,

  appState: state => state.appState,

  boardPieceTypes: state => state.boardData.pieceTypes,
  boardPositions: state => state.boardData.boardPositions,

  feeds: state => state.boardData.boardPositions.filter(p => p.isActive && p.isFeed),
  pieces: state => state.pieces,
  empty: state => state.pieces.filter(p => p.val === null).map(p => p.id),

  boardSelected: state => state.boardSelected,
};

const actions = {
  handleBoardTouch({ commit }, { index }) {
    // Make sure we are in idle state
    if (state.appState === 'IDLE') {
      const position = state.boardData.boardPositions[index];
      const selectedIndex = state.boardSelected.index;

      // Check if the position is selectable
      if (position.isActive && !position.isFeed && index != selectedIndex) {
        const selectedNeighbors = state.boardSelected.neighbors;
        // Check if the position is a current neighbor
        if (selectedIndex && selectedNeighbors.includes(index)) {
          // Remove board selection
          commit(types.CHANGE_BOARD_SELECTED, { index: null, neighbors: [] });

          // Swap the two positions
          commit(types.SWAP_BOARD_POSITIONS, { selectedIndex, index });

          // Check for match(s)
          // Swap back
          setTimeout(() =>
            commit(types.SWAP_BOARD_POSITIONS, { selectedIndex, index })
          , 500);

        } else {
          // Refresh our selected position
          const boardSize = state.boardSize;
          const neighbors = getNeighbors(index, boardSize);

          commit(types.CHANGE_BOARD_SELECTED, { index, neighbors });
        }
      } else {
        // Remove board selection
        commit(types.CHANGE_BOARD_SELECTED, { index: null, neighbors: [] });
      }
    }
  },

  fillBoard({ commit }) {
    const feeds = getters.feeds(state);
    console.debug(feeds);

    feeds.forEach(feed => {
      const { flowDirection, id } = feed;
      const boardSize = state.boardSize;
      let flowCount = 0;

      switch (flowDirection) {
        case 'DOWN': {
          console.debug('feed flows down')
          const next = getNeighborDown(id, boardSize);
          console.debug(next);
        }
      }
    });
  },

  removePieces({ commit }, { indices }) {
    indices.forEach(index => {
      commit(types.REMOVE_PIECE, { index });
    });
  },
};

const mutations = {
  [types.CHANGE_BOARD_SELECTED](state, { index, neighbors }) {
    state.boardSelected = {
      ...state.boardSelected,
      index,
      neighbors,
    };
  },

  [types.SWAP_BOARD_POSITIONS](state, { selectedIndex, index }) {
    const pieces = state.pieces;
    const a = pieces[selectedIndex];
    const b = pieces[index];

    pieces.splice(selectedIndex, 1, b);
    pieces.splice(index, 1, a);
  },

  [types.REMOVE_PIECE](state, { index }) {
    const pieces = state.pieces;
    const piece = { id: index, val: null };

    pieces.splice(index, 1, piece);
  },
};


function getNeighbors(index, boardSize) {
  const neighbors = [
    getNeighborUp(index, boardSize),
    getNeighborRight(index, boardSize),
    getNeighborDown(index, boardSize),
    getNeighborLeft(index),
  ];
  return neighbors.filter(n => filterFeeds(n, boardSize));
}

function getNeighborUp(index, boardSize) {
  const next = index - boardSize;
  return next >= 0 ? next : null;
}
function getNeighborDown(index, boardSize) {
  const next = index + boardSize;
  return next < boardSize ** 2 ? next : null;
}
function getNeighborLeft(index) {
  const next = index - 1;
  return next >= 0 ? next : null;
}
function getNeighborRight(index, boardSize) {
  const next = index + 1;
  return next < boardSize ** 2 ? next : null;
}

function filterFeeds(index, boardSize) {
  return (
    // Top row feeds
    index > boardSize &&
    // Bottom row feeds
    index < (boardSize ** 2) - boardSize &&
    // Left column feeds
    index % boardSize >= 1 &&
    // Right column feeds
    index % boardSize < boardSize - 1
  );
}

export default {
  state,
  getters,
  actions,
  mutations,
};
