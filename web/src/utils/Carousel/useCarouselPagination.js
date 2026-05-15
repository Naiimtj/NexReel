import { useCallback, useEffect, useMemo, useState } from 'react';

const DEFAULT_BREAKPOINTS = { sm: 2, md: 3, lg: 4, xl: 6 };

const computeCardsPerPage = (breakpoints) => {
  if (globalThis.window === undefined) return breakpoints.xl;
  const w = globalThis.window.innerWidth;
  if (w < 750) return breakpoints.sm;
  if (w < 1000) return breakpoints.md;
  if (w < 1280) return breakpoints.lg;
  return breakpoints.xl;
};

/**
 * Shared carousel pagination logic: responsive cards-per-page (with resize
 * listener), page navigation handlers, slice computation and the legacy
 * "trim trailing 2 items when even and not user/all" behavior.
 */
export const useCarouselPagination = ({
  items,
  breakpoints = DEFAULT_BREAKPOINTS,
  trimTrailing = true,
} = {}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [cardsPerPage, setCardsPerPage] = useState(() =>
    computeCardsPerPage(breakpoints),
  );

  useEffect(() => {
    const handleResize = () =>
      setCardsPerPage(computeCardsPerPage(breakpoints));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoints]);

  const allCards = useMemo(() => {
    if (trimTrailing && items.length > cardsPerPage && cardsPerPage % 2 === 0) {
      return items.slice(0, -2);
    }
    return items;
  }, [items, trimTrailing, cardsPerPage]);

  const totalPages = Math.max(1, Math.ceil(allCards.length / cardsPerPage));

  // Clamp current page when data shrinks (e.g. items removed) instead of
  // resetting to 1 on every parent re-render that produces a new array ref.
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startCardIndex = (currentPage - 1) * cardsPerPage;
  const visibleCards = allCards.slice(
    startCardIndex,
    startCardIndex + cardsPerPage,
  );
  const nextPageStart = startCardIndex + cardsPerPage;
  const prefetchCards = allCards.slice(
    nextPageStart,
    nextPageStart + cardsPerPage,
  );
  const hasOverflow = allCards.length > cardsPerPage;
  const canPrev = currentPage > 1;
  const canNext = startCardIndex + cardsPerPage < allCards.length;

  const handleNext = useCallback(() => {
    setCurrentPage((p) => (p < totalPages ? p + 1 : p));
  }, [totalPages]);
  const handlePrev = useCallback(() => {
    setCurrentPage((p) => (p > 1 ? p - 1 : p));
  }, []);
  const goToPage = useCallback((n) => setCurrentPage(n), []);

  return {
    currentPage,
    cardsPerPage,
    allCards,
    totalPages,
    startCardIndex,
    visibleCards,
    prefetchCards,
    hasOverflow,
    canPrev,
    canNext,
    handleNext,
    handlePrev,
    goToPage,
  };
};

export default useCarouselPagination;
