import { useNav, useSlideContext } from "@slidev/client";
import { computed } from "vue";

// Every slide from the first one with `bonus: true` in its frontmatter is a bonus slide:
// not presented live, but kept in the deck for the audience to dig deeper.
export function useBonus() {
    const { slides } = useNav();
    const { $page } = useSlideContext();

    const bonusStart = computed(
        () => slides.value.find(route => route.meta.slide.frontmatter?.bonus === true)?.no ?? Number.POSITIVE_INFINITY,
    );
    const isBonus = computed(() => $page.value >= bonusStart.value);

    return { bonusStart, isBonus };
}
