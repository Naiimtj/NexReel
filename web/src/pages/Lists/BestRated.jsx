import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IoIosArrowBack } from 'react-icons/io';
import { useTranslation } from 'react-i18next';
import Multi from '../../components/MediaList/Multi';
import {
  getMediaDetails,
  getPersonDetails,
} from '../../../services/TMDB/services-tmdb';
import { movie, movie_purple, tv, tv_purple } from '../../assets/image';
import Spinner from '../../utils/Spinner/Spinner';
import { useAuthContext } from '../../context/auth-context';
import { useMediaContext } from '../../context/media-context';
import { getUser } from '../../../services/DB/services-db';
import SplitArrayGroups from '../../utils/SplitArrayGroups';
import ArrayPaginator from '../../utils/ArrayPaginator';
import { getCardsPerPage, uniqueById } from '../../utils/listHelpers';

const sortByRating = (a, b) => b.vote_average - a.vote_average;

const TabButton = ({ active, onSelect, iconOn, iconOff, label }) => (
  <button
    type="button"
    onClick={onSelect}
    className={`cursor-pointer flex gap-2 justify-center p-4 border-b-2 ${
      active
        ? 'text-purpleNR fill-purpleNR border-purpleNR'
        : 'border-transparent rounded-t-lg hover:border-gray-300 hover:text-gray-300'
    }`}
  >
    <img className="w-4 h-4" src={active ? iconOn : iconOff} alt="" />
    {label}
  </button>
);
const BestRated = () => {
  const [t] = useTranslation('translation');
  const navigate = useNavigate();
  const { media, id } = useParams();
  const { user } = useAuthContext();
  const { mediasUser } = useMediaContext();
  const userExist = !!user;

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [changeSeenPending, setChangeSeenPending] = useState(false);
  const [dataUser, setDataUser] = useState({});
  const [persona, setPersona] = useState({});
  const [filmsPerson, setFilmsPerson] = useState({});

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

  const allFilms =
    filmsPerson.cast && filmsPerson.crew
      ? uniqueById([
          ...uniqueById(filmsPerson.crew),
          ...uniqueById(filmsPerson.cast),
        ])
      : [];
  const filtered = allFilms.filter((m) => m.vote_average < 10);

  const knowMovie = filtered
    .filter((m) => m.media_type === 'movie')
    .sort(sortByRating);
  const knowTv = filtered
    .filter((m) => m.media_type === 'tv')
    .sort(sortByRating);
  const ready = knowMovie.length > 0 || knowTv.length > 0;

  const cardsPerPage = getCardsPerPage();
  const groupsMovie = knowMovie.length
    ? SplitArrayGroups(knowMovie, cardsPerPage)
    : [];
  const groupsTv = knowTv.length ? SplitArrayGroups(knowTv, cardsPerPage) : [];

  const selectTab = (idx) => () => {
    setSelectedIndex(idx);
    setCurrentPageIndex(0);
  };

  const renderGrid = (groups, list, isMovie) => (
    <>
      <ArrayPaginator
        data={groups}
        totalResult={list.length}
        groupSize={cardsPerPage}
        currentPageIndex={currentPageIndex}
        setCurrentPageIndex={setCurrentPageIndex}
      />
      <div className="mb-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
        {groups.length > 0 &&
          groups[currentPageIndex].map((m, key) => (
            <Multi
              key={`${isMovie ? 'Movie' : 'Tv'}BestRated${key}`}
              info={m}
              addButton
              media_movie={isMovie}
              media_tv={!isMovie}
              dataUser={dataUser}
              mediasUser={mediasUser}
              changeSeenPending={changeSeenPending}
              setChangeSeenPending={setChangeSeenPending}
            />
          ))}
      </div>
      <ArrayPaginator
        data={groups}
        totalResult={list.length}
        groupSize={cardsPerPage}
        currentPageIndex={currentPageIndex}
        setCurrentPageIndex={setCurrentPageIndex}
      />
    </>
  );

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
          {ready ? t('BEST RATED') : null}
        </h1>
        <div className="px-4 pb-4">
          <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-400">
            <li className="me-2">
              <TabButton
                active={selectedIndex === 0}
                onSelect={selectTab(0)}
                iconOn={movie_purple}
                iconOff={movie}
                label={t('Movies')}
              />
            </li>
            <li className="me-2">
              <TabButton
                active={selectedIndex === 1}
                onSelect={selectTab(1)}
                iconOn={tv_purple}
                iconOff={tv}
                label={`${t('TV Shows')}${t(' & Shows')}`}
              />
            </li>
          </ul>
          {selectedIndex === 0 &&
            (!ready ? (
              <Spinner result />
            ) : (
              renderGrid(groupsMovie, knowMovie, true)
            ))}
          {selectedIndex === 1 && renderGrid(groupsTv, knowTv, false)}
        </div>
      </div>
    </div>
  );
};

export default BestRated;
