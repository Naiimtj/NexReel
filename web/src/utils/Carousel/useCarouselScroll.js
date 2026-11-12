import { useCallback, useEffect, useState } from 'react';

const EDGE_TOLERANCE = 1;

/**
 * Overflow/edge state of a horizontal scroll track plus page-wise scrolling.
 * Native scrolling (trackpad, touch, shift+wheel) and the arrows share the
 * same scroll position, so the arrow state always matches what is in view.
 */
export const useCarouselScroll = (trackRef, itemCount) => {
  const [edges, setEdges] = useState({
    hasOverflow: false,
    canPrev: false,
    canNext: false,
  });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    // Scroll and resize callbacks already fire at most once per frame.
    const update = () => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      const next = {
        hasOverflow: maxScroll > EDGE_TOLERANCE,
        canPrev: track.scrollLeft > EDGE_TOLERANCE,
        canNext: track.scrollLeft < maxScroll - EDGE_TOLERANCE,
      };
      setEdges((prev) =>
        prev.hasOverflow === next.hasOverflow &&
        prev.canPrev === next.canPrev &&
        prev.canNext === next.canNext
          ? prev
          : next,
      );
    };
    update();
    track.addEventListener('scroll', update, { passive: true });
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(track);
    return () => {
      track.removeEventListener('scroll', update);
      resizeObserver.disconnect();
    };
  }, [trackRef, itemCount]);

  const scrollByPage = useCallback(
    (direction) => {
      const track = trackRef.current;
      if (!track) return;
      const reduceMotion = globalThis.matchMedia?.(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      // 90% of the view; scroll-snap then settles on the next card edge.
      track.scrollBy({
        left: direction * track.clientWidth * 0.9,
        behavior: reduceMotion ? 'auto' : 'smooth',
      });
    },
    [trackRef],
  );

  const scrollPrev = useCallback(() => scrollByPage(-1), [scrollByPage]);
  const scrollNext = useCallback(() => scrollByPage(1), [scrollByPage]);

  return { ...edges, scrollPrev, scrollNext };
};

export default useCarouselScroll;
