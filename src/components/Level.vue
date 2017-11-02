<template>
  <div class="level">
      <h1>Level {{ id }} ({{ type }})</h1>
      <h2>Moves: {{ moveCount }}</h2>
      <h3>Scores: {{ scoreGoals.one }}, {{ scoreGoals.two }}, {{ scoreGoals.three }}</h3>
      <h3>Your score: {{ currentScore }}</h3>
      <h3>High score: {{ highScore }}</h3>

    <board
      :boardData="boardData"
      @updateMoves="updateMoves"
      @updateScore="updateScore">
    </board>
  </div>
</template>

<script>
import Board from './Board';

export default {
  name: 'Level',
  components: { Board },
  props: {
    levelData: {
      type: Object,
      required: true,
    },
    boardData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      currentScore: null,
      highScore: null,
      moveCount: null,
    };
  },
  computed: {
    // Level data getters
    id() { return this.levelData.id; },
    scoreGoals() { return this.levelData.scoreGoals; },
    type() { return this.levelData.type; },
  },
  methods: {
    newGame() {
      const { highScore, moveCount } = this.levelData;

      this.currentScore = 0;
      this.highScore = highScore;
      this.moveCount = moveCount;
    },
    updateMoves(moves) {
      this.moveCount += moves;
    },
    updateScore(points) {
      const newScore = this.currentScore + points;

      this.currentScore = newScore;
      if (newScore > this.highScore) {
        this.highScore = newScore;
      }
    },
  },
  created() {
    this.newGame();
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss"></style>
