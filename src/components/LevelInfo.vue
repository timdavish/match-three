<template>
  <div class="level-info">
    <h1>Level {{ id }} ({{ type }})</h1>
    <h2>Moves: {{ moveCount }}</h2>
    <h3>Score Goals: {{ scoreGoals.one }}, {{ scoreGoals.two }}, {{ scoreGoals.three }}</h3>
    <h3>Your score: {{ currentScore }}</h3>
    <h3>High score: {{ highScore }}</h3>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'LevelInfo',
  props: {
    levelData: {
      type: Object,
      required: true,
    },
  },
  computed: {
    // Level data getters
    id() { return this.levelData.id; },
    scoreGoals() { return this.levelData.scoreGoals; },
    type() { return this.levelData.type; },

    ...mapGetters({
      currentScore: 'currentScore',
      highScore: 'highScore',
      moveCount: 'moveCount',
    }),
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss"></style>
