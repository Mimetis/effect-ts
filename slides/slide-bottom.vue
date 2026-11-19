<script setup lang="ts">
import { useSlideContext } from "@slidev/client";
import { computed } from "vue";
import { useBonus } from "./composables/useBonus";

// Rendered under every slide: the shared background (gradients + grid)
// and a terminal-like status bar with the page number (and a badge on bonus slides).
const { $page, $nav, $frontmatter, $slidev } = useSlideContext();
const { isBonus } = useBonus();

const HIDDEN_LAYOUTS = new Set(["cover", "section", "center", "end", "intro"]);

const visible = computed(
    () => $page.value > 1 && !HIDDEN_LAYOUTS.has(String($frontmatter.layout ?? "default")),
);
const pad = (value: number) => String(value).padStart(2, "0");
</script>

<template>
  <div class="tech-backdrop" />
  <footer v-if="visible" class="tech-statusbar">
    <span class="tech-statusbar__dot" />
    <span class="tech-statusbar__page">{{ pad($page) }}/{{ pad($nav.total) }}</span>
    <span>{{ $slidev.configs.title }}</span>
    <span v-if="isBonus" class="tech-statusbar__bonus">📚 bonus · pour approfondir</span>
  </footer>
</template>

<style>
.tech-backdrop {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(circle at 12% 18%, color-mix(in srgb, var(--tech-cyan) 16%, transparent), transparent 45%),
    radial-gradient(circle at 88% 85%, color-mix(in srgb, var(--tech-violet) 18%, transparent), transparent 50%);
}

.tech-backdrop::before {
  --tech-grid: calc(40px / var(--slidev-slide-zoom-scale, 1));
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--tech-border) 1px, transparent 1px),
    linear-gradient(90deg, var(--tech-border) 1px, transparent 1px);
  background-size: var(--tech-grid) var(--tech-grid);
  mask-image: radial-gradient(ellipse at 70% 50%, black 10%, transparent 70%);
  opacity: 0.6;
}
</style>
