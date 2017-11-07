import Vue from 'vue';
import Vuex from 'vuex';
import createLogger from 'vuex/dist/logger';

import * as actions from './actions';
import * as getters from './getters';
import * as mutations from './mutations';
import state from './state';

Vue.use(Vuex);

const development = process.env.NODE_ENV !== 'production';

const store = new Vuex.Store({
  actions,
  getters,
  mutations,
  state,
  strict: development,
  plugins: [...(development ? [createLogger()] : [])],
});

export default store;
