<template>
  <div :class="['tile', 'position_' + tile.row + '_' + tile.col, 'type_' + tile.type, { 'tile-new': tile.removed }]">
    <div :class="['tile-inner', { 'tile-selected': isSelected, 'tile-neighbor': isNeighbor }]"
      @click="$emit('touch')">
    </div>
  </div>
</template>

<script>
export default {
  name: 'Tile',
  props: {
    tile: {
      type: Object,
      required: true,
    },
    selected: {
      type: Object,
      required: true,
    },
  },
  computed: {
    isSelected() {
      return (
        this.selected.selected &&
        this.selected.row === this.tile.row &&
        this.selected.col === this.tile.col
      );
    },
    isNeighbor() {
      return this.selected.neighbors
        .some(n => n.row === this.tile.row && n.col === this.tile.col);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss"></style>
