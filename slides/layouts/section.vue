<script setup lang="ts">
import { useNav, useSlideContext } from "@slidev/client";
import { computed } from "vue";
import { useBonus } from "../composables/useBonus";

// Overrides the theme `section` layout: the chapter number and the progress
// bar are computed from the position of the slide among the `layout: section` slides
// of the same part (the talk, or the bonus slides).
const { slides } = useNav();
const { $page } = useSlideContext();
const { bonusStart, isBonus } = useBonus();

const sectionPages = computed(() =>
    slides.value
        .filter(route => route.meta.slide.frontmatter?.layout === "section")
        .filter(route => (route.no >= bonusStart.value) === isBonus.value)
        .map(route => route.no),
);
const index = computed(() => sectionPages.value.indexOf($page.value) + 1);
const total = computed(() => sectionPages.value.length);
const numbered = computed(() => index.value > 0 && total.value > 1);
const pad = (value: number) => String(value).padStart(2, "0");
</script>

<template>
  <div class="slidev-layout section tech-section" :class="{ 'is-bonus': isBonus }">
    <div v-if="numbered" class="tech-section__number">{{ pad(index) }}</div>

    <div class="tech-section__body">
      <div v-if="numbered" class="tech-section__label">
        <span>{{ isBonus ? "📚 Bonus" : "Chapitre" }} {{ pad(index) }}</span>
        <span class="tech-section__total">/ {{ pad(total) }}</span>
      </div>
      <slot />
    </div>

    <div v-if="numbered" class="tech-section__progress">
      <span v-for="n in total" :key="n" :class="{ 'is-done': n <= index }" />
    </div>
  </div>
</template>

<style>
.slidev-layout.tech-section {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  overflow: hidden;
  padding-left: 5rem;
}

.tech-section__number {
  position: absolute;
  right: 3.5rem;
  top: 50%;
  transform: translateY(-50%);
  font-family: var(--tech-font-mono);
  font-size: 15rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.06em;
  background: var(--tech-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  opacity: 0.18;
  pointer-events: none;
  user-select: none;
}

.tech-section__body {
  position: relative;
  max-width: 34rem;
}

.tech-section__label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-family: var(--tech-font-mono);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--tech-cyan);
}

.tech-section__label::before {
  content: "";
  width: 2.5rem;
  height: 2px;
  border-radius: 2px;
  background: var(--tech-gradient);
}

.tech-section__total {
  color: var(--tech-muted);
}

.tech-section.is-bonus .tech-section__label {
  color: var(--tech-violet);
}

.slidev-layout.tech-section h1 {
  margin: 0;
  font-size: 3.2rem;
  font-weight: 700;
  line-height: 1.15;
  color: var(--tech-fg-strong);
}

.slidev-layout.tech-section h1 code {
  font-size: 0.85em;
}

.slidev-layout.tech-section h3 {
  margin-top: 1rem;
  font-size: 1.3rem;
  font-weight: 400;
  color: var(--tech-muted);
}

.tech-section__progress {
  position: absolute;
  left: 5rem;
  bottom: 2.5rem;
  display: flex;
  gap: 0.4rem;
}

.tech-section__progress span {
  width: 1.8rem;
  height: 4px;
  border-radius: 4px;
  background: var(--tech-border);
}

.tech-section__progress span.is-done {
  background: var(--tech-gradient);
}
</style>
