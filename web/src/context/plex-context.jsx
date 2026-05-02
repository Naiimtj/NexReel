/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useState } from 'react';
import { getPlexMovies, getPlexTv } from '../../services/DB/services-db';
import { useAuthContext } from './auth-context';

const PlexContext = createContext({
  plexMovieImdbIds: new Set(),
  plexMovieTmdbIds: new Set(),
  plexTvImdbIds: new Set(),
  plexTvTmdbIds: new Set(),
});

export function PlexProvider({ children }) {
  const { user } = useAuthContext();
  const [plexMovieImdbIds, setPlexMovieImdbIds] = useState(new Set());
  const [plexMovieTmdbIds, setPlexMovieTmdbIds] = useState(new Set());
  const [plexTvImdbIds, setPlexTvImdbIds] = useState(new Set());
  const [plexTvTmdbIds, setPlexTvTmdbIds] = useState(new Set());

  useEffect(() => {
    if (!user || !user.isPlexFriend) {
      setPlexMovieImdbIds(new Set());
      setPlexMovieTmdbIds(new Set());
      setPlexTvImdbIds(new Set());
      setPlexTvTmdbIds(new Set());
      return;
    }
    const loadIds = (fetchFn, setImdb, setTmdb) =>
      fetchFn()
        .then((data) => {
          if (!data?.length) return;
          setImdb(new Set(data.map((m) => m.imdbId).filter(Boolean)));
          setTmdb(new Set(data.map((m) => m.tmdbId).filter(Boolean)));
        })
        .catch(() => {});
    loadIds(getPlexMovies, setPlexMovieImdbIds, setPlexMovieTmdbIds);
    loadIds(getPlexTv, setPlexTvImdbIds, setPlexTvTmdbIds);
  }, [user]);

  return (
    <PlexContext.Provider
      value={{
        plexMovieImdbIds,
        plexMovieTmdbIds,
        plexTvImdbIds,
        plexTvTmdbIds,
      }}
    >
      {children}
    </PlexContext.Provider>
  );
}

export function usePlexContext() {
  return useContext(PlexContext);
}
