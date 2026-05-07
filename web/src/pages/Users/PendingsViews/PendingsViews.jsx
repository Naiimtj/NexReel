import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getDetailUser, getUser } from '../../../../services/DB/services-db';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../../../context/auth-context';
import { useMediaContext } from '../../../context/media-context';
import { HiSortAscending, HiSortDescending } from 'react-icons/hi';
import Carousel from '../../../utils/Carousel/Carousel';
import Multi from '../../../components/MediaList/Multi';
import MultiList from '../../../components/MediaList/MultiList';
import ViewToggle from '../../../utils/Buttons/ViewToggle';
import NavArrowButton from '../../../utils/Buttons/NavArrowButton';

function DataOrder(check, data, state) {
  const DataPendingOrder = state
    ? check &&
      data.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))
    : check &&
      data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  return DataPendingOrder;
}

const PendingsViews = () => {
  const [t] = useTranslation('translation');
  const navigate = useNavigate();

  const { user } = useAuthContext();
  const { id } = useParams();
  const { pathname } = useLocation();
  const isOtherUser = user.id !== id;
  const [dataUser, setDataUser] = useState({});
  const [changeSeenPending, setChangeSeenPending] = useState(false);
  const [visualDesign, setVisualDesign] = useState(0);
  useEffect(() => {
    const Data = async () => {
      getUser()
        .then((data) => {
          setDataUser(data);
        })
        .catch((err) => err);
    };
    const userData = async () => {
      getDetailUser(id).then((d) => {
        setDataUser(d.user);
      });
    };
    if (!isOtherUser) {
      Data();
    }
    if (isOtherUser) {
      userData();
    }
  }, [changeSeenPending, id, isOtherUser]);
  const { mediasUser } = useMediaContext();
  const checkMedias = !!(
    dataUser &&
    dataUser.medias &&
    dataUser.medias.length > 0
  );
  let actualPage;
  let title;
  if (pathname.startsWith('/pending')) {
    actualPage = 'pending';
    title = 'pendings';
  } else if (pathname.startsWith('/view')) {
    actualPage = 'seen';
    title = 'views';
  } else {
    actualPage = null;
  }

  const [isAsc, setIsAsc] = useState(false);
  const dataMedias = checkMedias
    ? DataOrder(
        checkMedias,
        dataUser.medias.filter((i) => i[actualPage] !== false),
        isAsc,
      )
    : null;
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

  return (
    <div className="w-full h-full text-gray-200">
      <div className="text-gray-200 mb-20 mt-6">
        <div className="text-gray-200 mb-4">
          {/* // . BACK USER */}
          <NavArrowButton
            direction="back"
            label={dataUser.username}
            onClick={() =>
              navigate(isOtherUser ? `/users/${dataUser.id}` : '/me')
            }
            className="capitalize"
          />
        </div>
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4 px-4">
          {/* // . Asc/Desc */}
          <div className="flex items-center justify-center">
            {isAsc ? (
              <button
                className="transition ease-in-out text-[#b1a9fa] fill-[#b1a9fa] md:hover:fill-gray-500 md:hover:text-gray-500 duration-300 cursor-pointer tracking-wide"
                onClick={() =>
                  checkMedias && dataMedias.length ? setIsAsc(!isAsc) : null
                }
                disabled={!checkMedias || !dataMedias.length}
              >
                {t('Date Added')}
                <HiSortAscending
                  className="ml-1 text-2xl inline-block"
                  alt={t('Ascendant')}
                />
              </button>
            ) : (
              <button
                className="transition ease-in-out text-[#b1a9fa] fill-[#b1a9fa] md:hover:fill-gray-500 md:hover:text-gray-500 duration-300 cursor-pointer tracking-wide"
                onClick={() =>
                  checkMedias && dataMedias.length ? setIsAsc(!isAsc) : null
                }
                disabled={!checkMedias || !dataMedias.length}
              >
                {t('Date Added')}
                <HiSortDescending
                  className="ml-1 text-2xl inline-block"
                  alt={t('Descending')}
                />
              </button>
            )}
          </div>
          {/* // . BUTTONs */}
          <div className="flex items-center justify-end">
            <ViewToggle
              visualDesign={visualDesign}
              setVisualDesign={setVisualDesign}
            />
          </div>
        </div>
        {/* // - TITLE */}
        {isCarousel ? null : (
          <div className="flex justify-between items-center">
            <div className="flex text-gray-200">
              <h1 className="pl-4 text-sm md:text-2xl uppercase">
                {`${t(title)} ( ${
                  checkMedias && dataMedias.length ? dataMedias.length : 0
                } )`}
              </h1>
            </div>
          </div>
        )}
        {/* // - CAROUSEL */}
        {checkMedias && dataMedias.length > 0 && isCarousel ? (
          <Carousel title={t(title)} info={dataMedias} isUser isAsc={isAsc} />
        ) : null}
        {/* // - SQUARE */}
        {checkMedias && dataMedias.length > 0 && isSquare ? (
          <div className="my-4 grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
            {dataMedias.map((card, index) => (
              <Multi
                key={`Square${index + card.id}`}
                info={card}
                isUser
                setChangeSeenPending={setChangeSeenPending}
                changeSeenPending={changeSeenPending}
                mediasUser={mediasUser}
              />
            ))}
          </div>
        ) : null}
        {/* // - LIST */}
        {checkMedias && dataMedias.length > 0 && isList ? (
          <div className="flex flex-col gap-1">
            {dataMedias.map((card, index) => (
              <MultiList
                key={`List${index + card.id}`}
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

export default PendingsViews;
