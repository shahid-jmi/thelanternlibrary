import { useRef, type WheelEvent } from 'react';

export function useCarousel() {
  const ref = useRef<HTMLDivElement>(null);

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

  return { ref, onWheel, scrollBy };
}
