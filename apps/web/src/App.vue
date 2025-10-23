<template>
  <div class="app-container">
    <HelloMonaco />
  </div>
</template>

<script setup lang="ts">
import HelloMonaco from './components/HelloMonaco.vue'
</script>

<style lang="scss" scoped>
.app-container {
  width: 100%;
  height: 100%; /* 继承父级高度，填满屏幕 */
  padding: 20px;
  box-sizing: border-box; /* 确保 padding 不会导致宽度/高度超出父级 */
  display: flex;
  flex-direction: column;
  /* 可选：如果内容可能超出屏幕，控制溢出行为 */
  overflow: auto;
}
</style>