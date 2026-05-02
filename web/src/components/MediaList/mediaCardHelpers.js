import { useEffect, useState } from 'react';
import { movie, people, tv } from '../../assets/image';
import {
  getExternalId,
  getMediaDetails,
} from '../../../services/TMDB/services-tmdb';
import { getRating } from '../../../services/IMDB/services-imdb';

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

export const useMediaData = (mediaType, id, language) => {
  const [dataMedia, setDataMedia] = useState({});
  const [imdbID, setImdbID] = useState('');
  const [imdbData, setImdbData] = useState({});

  useEffect(() => {
    if (language && mediaType && id) {
      getMediaDetails(mediaType, id, language).then(setDataMedia);
    }
  }, [id, mediaType, language]);

  useEffect(() => {
    if (language && mediaType && id) {
      getExternalId(mediaType, id, language).then((data) =>
        setImdbID(data.imdb_id),
      );
    }
  }, [language, id, mediaType]);

  useEffect(() => {
    if (language && mediaType && imdbID) {
      getRating(imdbID).then((data) => setImdbData(data ?? {}));
    }
  }, [language, imdbID, mediaType]);

  return { dataMedia, imdbID, imdbData };
};

export const useMediaUserEntry = (mediasUser, id, mediaType, deps = []) => {
  const [dataMediaUser, setDataMediaUser] = useState({});
  useEffect(() => {
    const found = mediasUser?.find(
      (f) => Number(f.mediaId) === Number(id) && mediaType === f.media_type,
    );
    setDataMediaUser(found ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, mediaType, mediasUser, ...deps]);
  return [dataMediaUser, setDataMediaUser];
};

export const roundedVote = (vote) =>
  vote > 0 ? Math.round(vote * 10) / 10 : 0;

export const ratingFromImdb = (block) =>
  block?.audience?.rating > 0 ? Number(block.audience.rating) : null;
