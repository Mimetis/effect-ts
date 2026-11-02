/**
 * A clicked button keeps the keyboard focus, so the arrow keys stop moving
 * between slides (and a focus ring appears). This affects the Run buttons of
 * the live demos, the nav bar buttons and the theme toggle.
 * Give the focus back to the slides after any mouse click on a button.
 */
export default () => {
    if (typeof document === "undefined") {
        return;
    }
    document.addEventListener("click", (event) => {
        // Keyboard activation (Enter / Space) reports detail === 0: keep the focus there
        if (event.detail === 0 || !(event.target instanceof Element)) {
            return;
        }
        const button = event.target.closest("button, .slidev-icon-btn");
        if (button instanceof HTMLElement) {
            requestAnimationFrame(() => button.blur());
        }
    });
};
