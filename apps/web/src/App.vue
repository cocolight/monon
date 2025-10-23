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
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
</style>