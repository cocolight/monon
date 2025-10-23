<template>
  <div class="edit-container"></div>
  <MonacoMarkdownEditor style="height: 600px; width: 100%;" />
</template>

<script setup lang="ts">
import { MonacoMarkdownEditor} from '@monon/editor'

</script>

<style scoped lang="scss">
.edit-container {
  width: 1024px;
  max-width: 100%;
  margin: 0 auto;
  overflow: hidden;
  position: relative;
}

</style>