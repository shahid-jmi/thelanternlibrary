import { useCallback, useEffect, useRef, useState, type WheelEvent } from 'react';

/**
 * Horizontal card row. Tracks whether the row actually overflows so callers
 * can hide the arrows and centre the cards when everything already fits —
 * with only a few featured items, arrows that do nothing and a half-empty
 * left-aligned row look broken.
 *
 * `contentKey` should change whenever the set of cards changes (e.g. a filter
 * switch), so the row resets to the start and re-measures.
 */
export function useCarousel(contentKey?: unknown) {
  const ref = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const measure = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    // 1px slack absorbs sub-pixel rounding at fractional zoom levels.
    setOverflowing(node.scrollWidth > node.clientWidth + 1);
    setAtStart(node.scrollLeft <= 1);
    setAtEnd(node.scrollLeft + node.clientWidth >= node.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(node);
    node.addEventListener('scroll', measure, { passive: true });
    return () => {
      resizeObserver.disconnect();
      node.removeEventListener('scroll', measure);
    };
  }, [measure]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.scrollTo({ left: 0 });
    // Wait a frame so the new cards are laid out before measuring.
    const frame = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frame);
  }, [contentKey, measure]);

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    // A horizontally-scrollable row will otherwise capture a plain vertical
    // mouse-wheel/trackpad scroll and turn it into horizontal movement,
    // trapping the page. Only take over when the gesture is actually
    // horizontal (a trackpad swipe) — pass a vertical scroll to the page.
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      window.scrollBy({ top: event.deltaY });
    }
  };

  const scrollBy = (direction: number) => {
    ref.current?.scrollBy({ left: direction * 300, behavior: 'smooth' });
  };

  return { ref, onWheel, scrollBy, overflowing, atStart, atEnd };
}
