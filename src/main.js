// Vue
import Vue from 'vue';
import router from './router';

// App scss
import './assets/style/app.scss';

// App component
import App from './components/App';

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App),
});
