<template>
  <div class="level">
    <levelInfo
      :levelData="levelData">
    </levelInfo>

    <board
      :boardData="boardData"
      @updateMoves="updateMoves"
      @updateScore="updateScore">
    </board>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

import Board from './Board';
import LevelInfo from './LevelInfo';

export default {
  name: 'Level',
  components: { Board, LevelInfo },
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
  methods: {
    ...mapActions({
      newGame: 'newGame',
      updateMoves: 'updateMoves',
      updateScore: 'updateScore',
    }),
  },
  created() {
    this.newGame(this.levelData);
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss"></style>
