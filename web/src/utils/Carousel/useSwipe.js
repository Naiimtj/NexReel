import { useCallback, useRef } from 'react';

/**
 * Touch-swipe handlers for mobile/tablet horizontal navigation.
 * Returns props to spread on the swipeable container.
 */
export const useSwipe = ({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
} = {}) => {
  const startX = useRef(null);
  const startY = useRef(null);

  const onTouchStart = useCallback((e) => {
    const t = e.touches[0];
    startX.current = t.clientX;
    startY.current = t.clientY;
  }, []);

  const onTouchEnd = useCallback(
    (e) => {
      if (startX.current == null) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX.current;
      const dy = t.clientY - startY.current;
      startX.current = null;
      startY.current = null;
      // Only treat as swipe if mostly horizontal and past threshold so taps
      // and vertical scrolls keep working normally.
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
        if (dx < 0) onSwipeLeft?.();
        else onSwipeRight?.();
      }
    },
    [onSwipeLeft, onSwipeRight, threshold],
  );

  return { onTouchStart, onTouchEnd };
};

export default useSwipe;
