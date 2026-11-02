<script setup lang="ts">
import { useDarkMode, useNav } from "@slidev/client";

// Always-visible light / dark toggle in the top-right corner of the slides
// (same as the nav bar button or the `d` shortcut, but easier to find).
const { isDark, toggleDark, isColorSchemaConfigured } = useDarkMode();
const { isPrintMode } = useNav();

// Give the focus back to the slides so the arrow keys keep navigating.
function onToggle(event: MouseEvent) {
  toggleDark();
  (event.currentTarget as HTMLElement).blur();
}
</script>

<template>
  <button
    v-if="!isColorSchemaConfigured && !isPrintMode"
    class="absolute top-3 right-3 z-100 p-2 rounded-full text-lg opacity-40 hover:opacity-100 hover:bg-gray-400/20 transition" 
    :title="isDark ? 'Passer en mode clair' : 'Passer en mode sombre'"
    @mousedown.prevent
    @click="onToggle"
  >
    <div :class="isDark ? 'i-carbon-sun' : 'i-carbon-moon'" />
  </button>
</template>
