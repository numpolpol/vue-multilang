<template>
  <div class="min-h-screen bg-base-200 w-full">
    <router-view></router-view>
  </div>
</template>

<script lang="ts" setup>
// No imports needed
</script>

<style>
/* Add any global styles here */
body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  width: 100%;
}

* {
  box-sizing: border-box;
}
</style>
