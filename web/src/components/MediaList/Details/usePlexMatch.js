import { useEffect, useState } from 'react';
import { getPlexMovies, getPlexTv } from '../../../../services/DB/services-db';

const removeDiacritics = (text) =>
  text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const compareStrings = (a, b) =>
  removeDiacritics(a).toLowerCase() === removeDiacritics(b).toLowerCase();

const removeSpaces = (str) => str.replace(/\s/g, '');

/**
 * Determines whether the given media (movie/tv) is present in the user's
 * Plex library. Tries ID-based matching first, then falls back to title.
 */
export default function usePlexMatch({
  enabled,
  mediaType,
  id,
  imdbId,
  originalTitle,
  title,
  releaseDate,
}) {
  const [isInPlex, setIsInPlex] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsInPlex(false);
      return;
    }

    const fetchFn = mediaType === 'movie' ? getPlexMovies : getPlexTv;
    fetchFn().then((data) => {
      if (!data || !data.length) return;

      // ID-based match (fastest, most reliable)
      if (mediaType === 'movie' && imdbId) {
        if (data.some((i) => i.imdbId === imdbId)) {
          setIsInPlex(true);
          return;
        }
      }
      if (id && data.some((i) => i.tmdbId === String(id))) {
        setIsInPlex(true);
        return;
      }

      // Title-based fallback
      if (!originalTitle) return;
      const yearMedia = releaseDate
        ? new Date(releaseDate).getFullYear()
        : null;

      const found = data.some(
        (i) =>
          removeSpaces(i.originalTitle.toLowerCase()) ===
            removeSpaces(originalTitle.toLowerCase()) ||
          removeSpaces(i.title.toLowerCase()) ===
            removeSpaces(originalTitle.toLowerCase()) ||
          removeSpaces(i.originalTitle.toLowerCase()) ===
            removeSpaces(title.toLowerCase()) ||
          removeSpaces(i.title.toLowerCase()) ===
            removeSpaces(title.toLowerCase()) ||
          compareStrings(i.originalTitle, originalTitle) ||
          compareStrings(i.title, originalTitle) ||
          compareStrings(i.originalTitle, title) ||
          (compareStrings(i.title, title) &&
            Number(i.year) === Number(yearMedia)),
      );
      setIsInPlex(found);
    });
  }, [enabled, mediaType, id, imdbId, originalTitle, title, releaseDate]);

  return isInPlex;
}
