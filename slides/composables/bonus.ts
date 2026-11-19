interface SlideRouteLike {
    readonly no: number;
    readonly meta: { readonly slide: { readonly frontmatter?: Record<string, unknown> } };
}

/**
 * Every slide from the first one with `bonus: true` in its frontmatter is a bonus slide:
 * not presented live, but kept in the deck for the audience to dig deeper.
 * Returns the number of that first bonus slide (Infinity when there is none).
 */
export const findBonusStart = (slides: ReadonlyArray<SlideRouteLike>): number =>
    slides.find(route => route.meta.slide.frontmatter?.bonus === true)?.no ?? Number.POSITIVE_INFINITY;
