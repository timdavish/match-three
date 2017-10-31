<template>
  <div id="app">
    <level
      :levelData="levelData"
      :boardData="boardData">
    </level>
  </div>
</template>

<script>
import Level from './Level';
import { level } from '../services/level.service';

const { levelData, boardData } = level();

export default {
  name: 'App',
  components: { Level },
  computed: {
    levelData() { return levelData; },
    boardData() { return boardData; },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: normal;
}
</style>
