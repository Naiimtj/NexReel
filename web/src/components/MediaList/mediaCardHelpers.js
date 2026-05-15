import { useEffect, useState } from 'react';
import { movie, people, tv } from '../../assets/image';
import {
  getExternalId,
  getMediaDetails,
} from '../../../services/TMDB/services-tmdb';
import {
  getImdbApiRating,
  getRating,
} from '../../../services/IMDB/services-imdb';

const POSTER_BASE = 'https://www.themoviedb.org/t/p/w300_and_h450_bestv2';

export const resolveMediaType = (mediaMovie, mediaTv, fallback) => {
  if (mediaMovie) return 'movie';
  if (mediaTv) return 'tv';
  return fallback;
};

export const resolvePosterUrl = (posterPath, profilePath) => {
  if (posterPath) return `${POSTER_BASE}${posterPath}`;
  if (profilePath) return `${POSTER_BASE}${profilePath}`;
  return null;
};

export const resolveDate = (releaseDate, firstAirDate, knownForDepartment) => {
  if (releaseDate) return new Date(releaseDate).getFullYear();
  if (firstAirDate) return new Date(firstAirDate).getFullYear();
  return knownForDepartment;
};

export const resolveTypeIcon = (type) => {
  if (type === 'movie') return movie;
  if (type === 'tv') return tv;
  if (type === 'person') return people;
  return null;
};

export const isMediaInPlex = (
  mediaType,
  id,
  imdbID,
  { plexMovieImdbIds, plexMovieTmdbIds, plexTvImdbIds, plexTvTmdbIds },
) => {
  const tmdbIdStr = String(id);
  if (mediaType === 'movie') {
    return (
      (imdbID && plexMovieImdbIds.has(imdbID)) ||
      plexMovieTmdbIds.has(tmdbIdStr)
    );
  }
  if (mediaType === 'tv') {
    return (
      (imdbID && plexTvImdbIds.has(imdbID)) || plexTvTmdbIds.has(tmdbIdStr)
    );
  }
  return false;
};

// ─── Module-level caches (cleared on page refresh) ──────────────────────────
const _detailsCache = new Map();
const _externalIdCache = new Map();
const _imdbRatingCache = new Map();

export const useMediaData = (mediaType, id, language) => {
  const detailKey = `${mediaType}__${id}__${language}`;
  const extKey = `${mediaType}__${id}__${language}`;

  const [dataMedia, setDataMedia] = useState(
    () => _detailsCache.get(detailKey) ?? {},
  );
  const [imdbID, setImdbID] = useState(
    () => _externalIdCache.get(extKey) ?? '',
  );

  useEffect(() => {
    if (!language || !mediaType || !id) return;
    if (_detailsCache.has(detailKey)) {
      setDataMedia(_detailsCache.get(detailKey));
      return;
    }
    getMediaDetails(mediaType, id, language).then((data) => {
      _detailsCache.set(detailKey, data);
      setDataMedia(data);
    });
  }, [id, mediaType, language, detailKey]);

  useEffect(() => {
    if (!language || !mediaType || !id) return;
    if (_externalIdCache.has(extKey)) {
      setImdbID(_externalIdCache.get(extKey));
      return;
    }
    getExternalId(mediaType, id, language).then((data) => {
      const imdb = data.imdb_id ?? '';
      _externalIdCache.set(extKey, imdb);
      setImdbID(imdb);
    });
  }, [language, id, mediaType, extKey]);

  return { dataMedia, imdbID };
};

const EMPTY_MEDIA_USER = {};

export const useMediaUserEntry = (mediasUser, id, mediaType, deps = []) => {
  const [dataMediaUser, setDataMediaUser] = useState(EMPTY_MEDIA_USER);
  useEffect(() => {
    const found = mediasUser?.find(
      (f) => Number(f.mediaId) === Number(id) && mediaType === f.media_type,
    );
    setDataMediaUser(found ?? EMPTY_MEDIA_USER);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, mediaType, mediasUser, ...deps]);
  return [dataMediaUser, setDataMediaUser];
};

export const useImdbData = (mediaType, id, language) => {
  const [imdbID, setImdbID] = useState('');
  const [imdbData, setImdbData] = useState({});

  useEffect(() => {
    if (language && mediaType && id) {
      getExternalId(mediaType, id, language).then((data) =>
        setImdbID(data.imdb_id),
      );
    }
  }, [language, id, mediaType]);

  useEffect(() => {
    if (imdbID) {
      getRating(imdbID).then((data) => setImdbData(data ?? {}));
    }
  }, [imdbID]);

  return { imdbID, imdbData };
};

export const roundedVote = (vote) =>
  vote > 0 ? Math.round(vote * 10) / 10 : 0;

export const ratingFromImdb = (block) =>
  block?.audience?.rating > 0 ? Number(block.audience.rating) : null;

export const useImdbApiRating = (imdbID, userExist) => {
  const shouldFetch = userExist && !!imdbID;

  const [value, setValue] = useState(() =>
    shouldFetch && _imdbRatingCache.has(imdbID)
      ? _imdbRatingCache.get(imdbID)
      : null,
  );
  const [loading, setLoading] = useState(
    () => shouldFetch && !_imdbRatingCache.has(imdbID),
  );

  useEffect(() => {
    if (!shouldFetch) {
      setValue(null);
      setLoading(false);
      return;
    }
    if (_imdbRatingCache.has(imdbID)) {
      setValue(_imdbRatingCache.get(imdbID));
      setLoading(false);
      return;
    }
    setLoading(true);
    getImdbApiRating(imdbID).then((rating) => {
      const resolved = rating ?? null;
      _imdbRatingCache.set(imdbID, resolved);
      setValue(resolved);
      setLoading(false);
    });
  }, [imdbID, userExist, shouldFetch]);

  return { value, loading };
};
