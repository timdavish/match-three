// Vue
import Vue from 'vue';
import router from './router';
import store from './store';

// App scss
import './assets/style/app.scss';

// App component
import App from './components/App';

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App),
});
