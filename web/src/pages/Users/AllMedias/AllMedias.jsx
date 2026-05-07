import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HiSortAscending, HiSortDescending } from 'react-icons/hi';
import { useAuthContext } from '../../../context/auth-context';
import { useMediaContext } from '../../../context/media-context';
import { getDetailUser, getUser } from '../../../../services/DB/services-db';
import { movie, movie_purple, tv, tv_purple } from '../../../assets/image';
import Carousel from '../../../utils/Carousel/Carousel';
import Multi from '../../../components/MediaList/Multi';
import MultiList from '../../../components/MediaList/MultiList';
import ViewToggle from '../../../utils/Buttons/ViewToggle';
import NavArrowButton from '../../../utils/Buttons/NavArrowButton';

const TAB_ALL = 'all';
const TAB_MOVIES = 'movie';
const TAB_TV = 'tv';

const STATUS_ALL = 'all';
const STATUS_SEEN = 'seen';
const STATUS_PENDING = 'pending';

function DataOrder(data, isAsc) {
  return [...data].sort((a, b) =>
    isAsc
      ? new Date(a.updatedAt) - new Date(b.updatedAt)
      : new Date(b.updatedAt) - new Date(a.updatedAt),
  );
}

const TabButton = ({ active, onSelect, iconOn, iconOff, label }) => (
  <button
    type="button"
    onClick={onSelect}
    className={`cursor-pointer flex gap-2 items-center justify-center px-4 py-2 border-b-2 text-sm font-medium ${
      active
        ? 'text-purpleNR fill-purpleNR border-purpleNR'
        : 'border-transparent rounded-t-lg hover:border-gray-300 hover:text-gray-300 text-gray-400'
    }`}
  >
    {iconOn && (
      <img className="w-4 h-4" src={active ? iconOn : iconOff} alt="" />
    )}
    {label}
  </button>
);

const StatusChip = ({ active, onSelect, label }) => (
  <button
    type="button"
    onClick={onSelect}
    className={`cursor-pointer px-3 py-1 rounded-full text-xs font-medium transition duration-200 ${
      active
        ? 'bg-purpleNR text-white'
        : 'bg-[#2c3349] text-gray-400 hover:bg-[#3a4463] hover:text-gray-200'
    }`}
  >
    {label}
  </button>
);

const AllMedias = () => {
  const [t] = useTranslation('translation');
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthContext();
  const { mediasUser } = useMediaContext();
  const isOtherUser = user.id !== id;

  const [dataUser, setDataUser] = useState({});
  const [changeSeenPending, setChangeSeenPending] = useState(false);
  const [visualDesign, setVisualDesign] = useState(0);
  const [isAsc, setIsAsc] = useState(false);
  const [activeTab, setActiveTab] = useState(TAB_ALL);
  const [statusFilter, setStatusFilter] = useState(STATUS_ALL);

  useEffect(() => {
    if (isOtherUser) {
      getDetailUser(id).then((d) => setDataUser(d.user));
    } else {
      getUser()
        .then(setDataUser)
        .catch((err) => err);
    }
  }, [changeSeenPending, id, isOtherUser]);

  const combinedMedias = [
    ...(dataUser?.medias || []),
    ...(dataUser?.mediasTv || []),
  ];

  const filtered = combinedMedias.filter((m) => {
    const matchesTab = activeTab === TAB_ALL || m.media_type === activeTab;
    const matchesStatus =
      statusFilter === STATUS_ALL ||
      (statusFilter === STATUS_SEEN && m.seen !== false) ||
      (statusFilter === STATUS_PENDING && m.pending !== false);
    return matchesTab && matchesStatus;
  });

  const dataMedias = filtered.length > 0 ? DataOrder(filtered, isAsc) : [];

  let isCarousel;
  let isSquare;
  let isList;
  switch (visualDesign) {
    case 1:
      isCarousel = null;
      isSquare = true;
      isList = null;
      break;
    case 2:
      isCarousel = null;
      isSquare = null;
      isList = true;
      break;
    default:
      isCarousel = true;
      isSquare = null;
      isList = null;
      break;
  }

  const tabLabels = {
    [TAB_ALL]: t('All'),
    [TAB_MOVIES]: t('Movies'),
    [TAB_TV]: t('TV Shows'),
  };
  const tabLabel = tabLabels[activeTab];

  return (
    <div className="w-full h-full text-gray-200">
      <div className="text-gray-200 mb-20 mt-6">
        <div className="text-gray-200 mb-4">
          <NavArrowButton
            direction="back"
            label={dataUser.username}
            onClick={() =>
              navigate(isOtherUser ? `/users/${dataUser.id}` : '/me')
            }
            className="capitalize"
          />
        </div>

        {/* Tabs: All / Movies / TV */}
        <div className="px-4 mb-2">
          <ul className="flex flex-wrap -mb-px text-sm font-medium">
            <li>
              <TabButton
                active={activeTab === TAB_ALL}
                onSelect={() => setActiveTab(TAB_ALL)}
                label={t('All')}
              />
            </li>
            <li>
              <TabButton
                active={activeTab === TAB_MOVIES}
                onSelect={() => setActiveTab(TAB_MOVIES)}
                iconOn={movie_purple}
                iconOff={movie}
                label={t('Movies')}
              />
            </li>
            <li>
              <TabButton
                active={activeTab === TAB_TV}
                onSelect={() => setActiveTab(TAB_TV)}
                iconOn={tv_purple}
                iconOff={tv}
                label={t('TV Shows')}
              />
            </li>
          </ul>
        </div>

        {/* Status filter + sort + view toggle */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4 px-4">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <StatusChip
                active={statusFilter === STATUS_ALL}
                onSelect={() => setStatusFilter(STATUS_ALL)}
                label={t('All')}
              />
              <StatusChip
                active={statusFilter === STATUS_SEEN}
                onSelect={() => setStatusFilter(STATUS_SEEN)}
                label={t('Seen')}
              />
              <StatusChip
                active={statusFilter === STATUS_PENDING}
                onSelect={() => setStatusFilter(STATUS_PENDING)}
                label={t('Pending')}
              />
            </div>

            <button
              className="transition ease-in-out text-[#b1a9fa] fill-[#b1a9fa] md:hover:fill-gray-500 md:hover:text-gray-500 duration-300 cursor-pointer tracking-wide"
              onClick={() => (dataMedias.length ? setIsAsc(!isAsc) : null)}
              disabled={!dataMedias.length}
            >
              {t('Date Added')}
              {isAsc ? (
                <HiSortAscending
                  className="ml-1 text-2xl inline-block"
                  alt={t('Ascendant')}
                />
              ) : (
                <HiSortDescending
                  className="ml-1 text-2xl inline-block"
                  alt={t('Descending')}
                />
              )}
            </button>
          </div>

          <div className="flex items-center justify-end">
            <ViewToggle
              visualDesign={visualDesign}
              setVisualDesign={setVisualDesign}
            />
          </div>
        </div>

        {/* Title for non-carousel views */}
        {isCarousel ? null : (
          <div className="flex justify-between items-center">
            <div className="flex text-gray-200">
              <h1 className="pl-4 text-sm md:text-2xl uppercase">
                {`${tabLabel} ( ${dataMedias.length} )`}
              </h1>
            </div>
          </div>
        )}

        {/* Carousel view */}
        {dataMedias.length > 0 && isCarousel ? (
          <Carousel
            title={tabLabel}
            info={dataMedias}
            isUser
            isAsc={isAsc}
            isSetChange={setChangeSeenPending}
            isChange={changeSeenPending}
          />
        ) : null}

        {/* Square grid view */}
        {dataMedias.length > 0 && isSquare ? (
          <div className="my-4 grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
            {dataMedias.map((card, index) => (
              <Multi
                key={`AllSquare${index + card.id}`}
                info={card}
                isUser
                setChangeSeenPending={setChangeSeenPending}
                changeSeenPending={changeSeenPending}
                mediasUser={mediasUser}
              />
            ))}
          </div>
        ) : null}

        {/* List view */}
        {dataMedias.length > 0 && isList ? (
          <div className="flex flex-col gap-1">
            {dataMedias.map((card, index) => (
              <MultiList
                key={`AllList${index + card.id}`}
                info={card}
                isUser
                setChangeSeenPending={setChangeSeenPending}
                changeSeenPending={changeSeenPending}
                mediasUser={mediasUser}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AllMedias;
