import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IoIosArrowBack } from 'react-icons/io';
import { useTranslation } from 'react-i18next';
import Multi from '../../components/MediaList/Multi';
import {
  getGenresList,
  getMediaDetails,
} from '../../../services/TMDB/services-tmdb';
import Spinner from '../../utils/Spinner/Spinner';
import { useAuthContext } from '../../context/auth-context';
import { useMediaContext } from '../../context/media-context';
import { getUser } from '../../../services/DB/services-db';
import ArrayPaginator from '../../utils/ArrayPaginator';
import GenreMapper from '../Genres/GenreMapper';

const ListMediasGenres = () => {
  const [t] = useTranslation('translation');
  const navigate = useNavigate();
  const { media, id, idGenre } = useParams();
  const { user } = useAuthContext();
  const { mediasUser } = useMediaContext();
  const userExist = !!user;

  const [changeSeenPending, setChangeSeenPending] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [dataUser, setDataUser] = useState({});
  const [genreNameList, setGenreNameList] = useState({});
  const [backMedia, setBackMedia] = useState({});

  useEffect(() => {
    if (userExist)
      getUser()
        .then(setDataUser)
        .catch((e) => e);
  }, [userExist, changeSeenPending]);

  useEffect(() => {
    if (media)
      getGenresList(media, t('es-ES')).then((r) => r && setGenreNameList(r));
  }, [media, t]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (id) getMediaDetails(media, id, t('es-ES')).then(setBackMedia);
  }, [media, id, t]);

  const mediaType = window.location.href.endsWith('listMovies')
    ? 'movie'
    : 'tv';
  const mediasGenre = GenreMapper(mediaType, idGenre, currentPageIndex + 1);
  const genre = genreNameList.genres?.find((g) => g.id === Number(idGenre));
  const nameGenre = genre?.name;
  const ready = mediasGenre && mediasGenre.total_results > 0;

  const paginatorProps = ready && {
    data: mediasGenre.results,
    totalResult: Math.min(mediasGenre.total_results, 10000),
    totalPages: Math.min(mediasGenre.total_pages, 500),
    groupSize: 20,
    currentPageIndex,
    setCurrentPageIndex,
  };

  return (
    <div className="w-full h-full text-gray-200 bg-local backdrop-blur-3xl bg-[#20283E]/80 rounded-3xl">
      <div className="text-gray-200 mb-20 mt-6">
        <div className="text-gray-200 mb-4">
          <button
            type="button"
            className="ml-5 pt-5 hover:text-[#6676a7]"
            onClick={() => navigate(`/${media}/${id}`)}
          >
            <IoIosArrowBack
              className="inline-block mr-1"
              size={25}
              alt={t('Back Icon')}
            />
            {backMedia.title}
          </button>
          <button
            type="button"
            className="ml-5 pt-5 hover:text-[#6676a7]"
            onClick={() => navigate(`/${media}/${id}/genre/${idGenre}`)}
          >
            <IoIosArrowBack
              className="inline-block mr-1"
              size={25}
              alt={t('Back Icon')}
            />
            {t(nameGenre)}
          </button>
        </div>
        <h1 className="text-gray-200 text-3xl text-center">
          {mediaType === 'movie' ? t('MOVIES') : t('TV SHOWS')}
        </h1>
        <div className="px-4 pb-4">
          {!ready ? (
            <Spinner result />
          ) : (
            <>
              <ArrayPaginator {...paginatorProps} />
              <div className="mb-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                {mediasGenre.results.map((mediaData, key) => (
                  <Multi
                    key={`MovieBestRated${key}`}
                    info={mediaData}
                    mediaMovie={mediaType === 'movie'}
                    mediaTv={mediaType === 'tv'}
                    dataUser={dataUser}
                    mediasUser={mediasUser}
                    changeSeenPending={changeSeenPending}
                    setChangeSeenPending={setChangeSeenPending}
                  />
                ))}
              </div>
              <ArrayPaginator {...paginatorProps} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListMediasGenres;
