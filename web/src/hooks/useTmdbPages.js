import { useCallback, useEffect, useRef, useState } from 'react';

const mediaKey = (item) => `${item.media_type}-${item.id}`;

// Rankings shift between requests, so a later page can repeat earlier items.
const appendUnique = (prev, results) => {
  const seen = new Set(prev.map(mediaKey));
  return [...prev, ...results.filter((item) => !seen.has(mediaKey(item)))];
};

/**
 * Accumulates the pages of a paginated TMDB list (infinite carousels).
 * `fetchPage(page)` must be memoized: a new function restarts from page 1.
 */
const useTmdbPages = (fetchPage) => {
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const cursorRef = useRef({ page: 0, loading: false });

  const load = useCallback(
    async (page) => {
      const cursor = cursorRef.current;
      cursor.loading = true;
      setIsLoading(true);
      const res = await fetchPage(page);
      // A restart replaces the cursor: drop responses for the previous list.
      if (cursorRef.current !== cursor) return;
      cursor.loading = false;
      setIsLoading(false);
      if (!Array.isArray(res.results)) {
        setHasMore(false);
        return;
      }
      cursor.page = page;
      setItems((prev) => appendUnique(page === 1 ? [] : prev, res.results));
      setHasMore(page < (res.total_pages ?? 0));
    },
    [fetchPage],
  );

  useEffect(() => {
    cursorRef.current = { page: 0, loading: false };
    load(1);
  }, [load]);

  const loadMore = useCallback(() => {
    const { page, loading } = cursorRef.current;
    if (!loading) load(page + 1);
  }, [load]);

  return { items, hasMore, loadMore, isLoading };
};

export default useTmdbPages;
