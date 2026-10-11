const scrollBehavior = (): ScrollBehavior =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

// Centre an element in the viewport so the sticky navbar can't cover it.
export function scrollIntoViewCentered(element: Element) {
  element.scrollIntoView({ block: 'center', behavior: scrollBehavior() });
}

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: scrollBehavior() });
}

// Forms use noValidate, so the browser no longer jumps to the first bad field.
// Call after validateNow() flags errors: waits a frame for React to render the
// aria-invalid markers, then scrolls to and focuses the first one in `root`.
export function focusFirstInvalid(root: Element | null) {
  requestAnimationFrame(() => {
    const field = root?.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (!field) return;
    scrollIntoViewCentered(field);
    field.focus({ preventScroll: true });
  });
}
