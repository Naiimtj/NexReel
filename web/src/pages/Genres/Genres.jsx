import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BsFillCaretRightFill } from 'react-icons/bs';
import { IoIosArrowBack } from 'react-icons/io';
import { useTranslation } from 'react-i18next';
import Carousel from '../../utils/Carousel/Carousel';
import {
  getDiscoverGenres,
  getGenresList,
  getMediaDetails,
} from '../../../services/TMDB/services-tmdb';
import PageTitle from '../../components/PageTitle';
import { TV_TO_MOVIE, MOVIE_TO_TV } from '../../utils/genreEquivalents';

const loadGenre = async (media, ids, lang) => {
  const first = await getDiscoverGenres(media, ids[0], lang);
  if (!first.total_results) return [];
  if (!ids[1]) return first.results;
  const second = await getDiscoverGenres(media, ids[1], lang);
  return second.total_results > 0
    ? [...first.results, ...second.results]
    : first.results;
};

const GenreSection = ({
  items,
  type,
  label,
  mediaType,
  id,
  idGenre,
  completeKey,
}) => {
  if (!items?.length) return null;
  return (
    <div className="pb-1 mt-4 rounded-3xl">
      <div className="flex justify-end">
        <Link
          className="flex items-center text-base text-purpleNR text-right hover:text-gray-200 mx-4 transition duration-300"
          to={`/${mediaType}/${id}/genre/${idGenre}/${completeKey}`}
        >
          {label.complete}
          <BsFillCaretRightFill className="align-middle" size={16} />
        </Link>
      </div>
      <Carousel title={label.title} info={items} media={type} />
    </div>
  );
};

function Genres() {
  const [t] = useTranslation('translation');
  const { id, media_type, idGenre } = useParams();
  const [genreMovie, setGenreMovie] = useState([]);
  const [genreTv, setGenreTv] = useState([]);
  const [detailsMedia, setDetailsMedia] = useState({});
  const [genreNameList, setGenreNameList] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!idGenre) return;
    const movieIds = TV_TO_MOVIE[idGenre] || [idGenre];
    const tvIds = [MOVIE_TO_TV[idGenre] || idGenre];
    loadGenre('movie', movieIds, t('es-ES')).then(setGenreMovie);
    loadGenre('tv', tvIds, t('es-ES')).then(setGenreTv);
  }, [idGenre, t]);

  useEffect(() => {
    if (!id || !media_type) return;
    getMediaDetails(media_type, id, t('es-ES')).then((r) => {
      if (Object.keys(r).length > 0) setDetailsMedia(r);
    });
  }, [id, media_type, t]);

  useEffect(() => {
    if (media_type)
      getGenresList(media_type, t('es-ES')).then(
        (r) => r && setGenreNameList(r),
      );
  }, [media_type, t]);

  const nameGenre = genreNameList.genres?.find(
    (g) => g.id === Number(idGenre),
  )?.name;
  const uniqueMovies = genreMovie.length
    ? Array.from(new Map(genreMovie.map((m) => [m.id, m])).values())
    : [];
  const backTitle = detailsMedia.title ?? detailsMedia.name;

  return (
    <div className="w-full h-full px-8 pb-5 mt-6 mb-20 text-gray-200 bg-local backdrop-blur-3xl bg-[#20283E]/80 rounded-3xl">
      <PageTitle title={t(nameGenre)} />
      <Link
        className="ml-5 pt-5 hover:text-[#6676a7]"
        to={`/${media_type}/${id}`}
      >
        <IoIosArrowBack
          className="inline-block mr-1"
          size={25}
          alt={t('Before')}
        />
        {backTitle}
      </Link>
      <div className="h-full w-full p-2 md:p-4">
        <h2 className="inline-block pr-2">{t('Genre')}: </h2>
        <p className="inline-block capitalize font-semibold text-lg">
          {t(nameGenre)}
        </p>
      </div>
      <GenreSection
        items={uniqueMovies}
        type="movie"
        label={{ title: t('MOVIES'), complete: t('Complete list') }}
        mediaType={media_type}
        id={id}
        idGenre={idGenre}
        completeKey="listMovies"
      />
      <GenreSection
        items={genreTv}
        type="tv"
        label={{ title: t('TV SHOWS'), complete: t('Complete list') }}
        mediaType={media_type}
        id={id}
        idGenre={idGenre}
        completeKey="listTvShows"
      />
    </div>
  );
}

export default Genres;
