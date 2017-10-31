import Vue from 'vue';
import Vuex from 'vuex';
import createLogger from 'vuex/dist/logger';

import * as actions from './actions';
import * as getters from './getters';
import level from './modules/level';
// import main from './modules/main';

Vue.use(Vuex);

const development = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  actions,
  getters,
  modules: {
    level,
    // main,
  },
  strict: development,
  plugins: [...(development ? [createLogger()] : [])],
});
