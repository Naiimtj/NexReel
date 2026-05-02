import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getDiscoverGenres } from '../../../services/TMDB/services-tmdb';
import { TV_TO_MOVIE, MOVIE_TO_TV } from '../../utils/genreEquivalents';

const mergeResults = (a, b, page) => ({
  page,
  results: [...a.results, ...b.results],
  total_pages: a.total_pages + b.total_pages,
  total_results: a.total_results + b.total_results,
});

const GenreMapper = (mediaType, idGenre, page) => {
  const [t] = useTranslation('translation');
  const [genreMedia, setGenreMedia] = useState([]);

  useEffect(() => {
    if (!idGenre) return;

    const targetMedia = mediaType === 'movie' ? 'movie' : 'tv';
    const ids =
      mediaType === 'movie'
        ? TV_TO_MOVIE[idGenre] || [idGenre]
        : [MOVIE_TO_TV[idGenre] || idGenre];

    const fetchGenre = (gid) =>
      getDiscoverGenres(targetMedia, gid, t('es-ES'), page);

    const run = async () => {
      const first = await fetchGenre(ids[0]);
      if (ids[1] && first.total_results > 0) {
        const second = await fetchGenre(ids[1]);
        setGenreMedia(
          second.total_results > 0
            ? mergeResults(first, second, page)
            : first.results,
        );
      } else {
        setGenreMedia(first);
      }
    };
    run();
  }, [idGenre, mediaType, t, page]);

  return genreMedia;
};

export default GenreMapper;
