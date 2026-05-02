import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IoIosArrowBack } from 'react-icons/io';
import { useTranslation } from 'react-i18next';
import Multi from '../../components/MediaList/Multi';
import {
  getMediaDetails,
  getPersonDetails,
} from '../../../services/TMDB/services-tmdb';
import Spinner from '../../utils/Spinner/Spinner';
import { useAuthContext } from '../../context/auth-context';
import { useMediaContext } from '../../context/media-context';
import { getUser } from '../../../services/DB/services-db';
import SplitArrayGroups from '../../utils/SplitArrayGroups';
import ArrayPaginator from '../../utils/ArrayPaginator';
import SortsMedias from '../../utils/SortsMedias';
import { getCardsPerPage, uniqueById } from '../../utils/listHelpers';

const ListMedias = () => {
  const [t] = useTranslation('translation');
  const navigate = useNavigate();
  const { media, id } = useParams();
  const { user } = useAuthContext();
  const { mediasUser } = useMediaContext();
  const userExist = !!user;

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [changeSeenPending, setChangeSeenPending] = useState(false);
  const [dataUser, setDataUser] = useState({});
  const [persona, setPersona] = useState({});
  const [filmsPerson, setFilmsPerson] = useState({});

  const mediaType = window.location.href.endsWith('listMovies')
    ? 'movie'
    : 'tv';
  const isMovie = mediaType === 'movie';

  useEffect(() => {
    if (userExist)
      getUser()
        .then(setDataUser)
        .catch((e) => e);
  }, [userExist, changeSeenPending]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    getMediaDetails(media, id, t('es-ES')).then(setPersona);
    getPersonDetails(media, id, t('es-ES')).then(setFilmsPerson);
  }, [t, media, id]);

  const unionKnow =
    filmsPerson.cast && filmsPerson.crew
      ? [...uniqueById(filmsPerson.crew), ...uniqueById(filmsPerson.cast)]
      : null;

  const filteredByType = unionKnow?.filter((m) => m.media_type === mediaType);
  const uniqueByDate = filteredByType
    ? new SortsMedias(filteredByType, mediaType).getUniqueMoviesByDate()
    : null;

  const ready = uniqueByDate && Object.keys(uniqueByDate).length > 0;
  const groups = ready ? SplitArrayGroups(uniqueByDate, getCardsPerPage()) : [];
  const total = uniqueByDate?.length ?? 0;

  const paginatorProps = ready && {
    data: groups,
    totalResult: total,
    groupSize: getCardsPerPage(),
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
            {persona.name}
          </button>
        </div>
        <h1 className="text-gray-200 text-3xl text-center">
          {isMovie ? t('MOVIES') : t('TV SHOWS')}
        </h1>
        <div className="px-4 pb-4">
          {!ready ? (
            <Spinner result />
          ) : (
            <>
              <ArrayPaginator {...paginatorProps} />
              <div className="mb-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                {groups.length > 0 &&
                  groups[currentPageIndex].map((m, key) => (
                    <Multi
                      key={`${mediaType}BestRated${key}`}
                      info={m}
                      mediaMovie={isMovie}
                      mediaTv={!isMovie}
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

export default ListMedias;
