<template>
  <div :class="['tile', 'position_' + tile.row + '_' + tile.col, 'type_' + tile.type, { 'tile-new': tile.removed }]">
    <div :class="['tile-inner', { 'tile-neighbor': isNeighbor, 'tile-selected': isSelected, 'tile-suggested': isSuggested }]"
      @click="$emit('touch', tile)">
      {{ tile.special }}
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
    selection: {
      type: Object,
      required: true,
    },
    suggestion: {
      type: Object,
      required: true,
    },
  },
  computed: {
    isNeighbor() {
      return this.selection.neighbors
        .some(n => n.row === this.tile.row && n.col === this.tile.col);
    },
    isSelected() {
      return (
        this.selection.selected &&
        this.selection.row === this.tile.row &&
        this.selection.col === this.tile.col
      );
    },
    isSuggested() {
      return (
        this.suggestion.suggested && (
          (this.suggestion.row1 === this.tile.row &&
           this.suggestion.col1 === this.tile.col) ||
          (this.suggestion.row2 === this.tile.row &&
           this.suggestion.col2 === this.tile.col)
        )
      );
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss"></style>
