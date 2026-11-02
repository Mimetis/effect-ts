<script setup lang="ts">
import { useSlideContext } from "@slidev/client";
import { computed } from "vue";

// Rendered inside every slide: a terminal-like status bar with the page number.
const { $page, $nav, $frontmatter, $slidev } = useSlideContext();

const HIDDEN_LAYOUTS = new Set(["cover", "section", "center", "end", "intro"]);

const visible = computed(
    () => $page.value > 1 && !HIDDEN_LAYOUTS.has(String($frontmatter.layout ?? "default")),
);
const pad = (value: number) => String(value).padStart(2, "0");
</script>

<template>
  <footer v-if="visible" class="tech-statusbar">
    <span class="tech-statusbar__dot" />
    <span class="tech-statusbar__page">{{ pad($page) }}/{{ pad($nav.total) }}</span>
    <span>{{ $slidev.configs.title }}</span>
  </footer>
</template>
