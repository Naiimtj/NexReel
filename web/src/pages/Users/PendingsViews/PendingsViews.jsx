import { IoIosArrowBack } from "react-icons/io";
import { Link, useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDetailUser, getUser } from "../../../../services/DB/services-db";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "../../../context/auth-context";
import { HiSortAscending, HiSortDescending } from "react-icons/hi";
import Carousel from "../../../utils/Carousel/Carousel";
import Multi from "../../../components/MediaList/Multi";
import { BsGrid3X2GapFill, BsListUl } from "react-icons/bs";
import { MdViewCarousel } from "react-icons/md";
import MultiList from "../../../components/MediaList/MultiList";

function DataOrder(check, data, state) {
  const DataPendingOrder = state
    ? check &&
      data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    : check &&
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return DataPendingOrder;
}

const PendingsViews = () => {
  const [t] = useTranslation("translation");
  const { user } = useAuthContext();
  const { id } = useParams();
  const { pathname } = useLocation();
  const isOtherUser = user.id !== id;
  const [dataUser, setDataUser] = useState({});
  const [changeSeenPending, setChangeSeenPending] = useState(false);
  const [visualDesing, setVisualDesign] = useState(0);
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
  const checkMedias = !!(
    dataUser &&
    dataUser.medias &&
    dataUser.medias.length > 0
  );
  let actualPage;
  let title;
  if (pathname.startsWith("/pending")) {
    actualPage = "pending";
    title = "pendings";
  } else if (pathname.startsWith("/view")) {
    actualPage = "seen";
    title = "views";
  } else {
    actualPage = null;
  }

  const [isAsc, setIsAsc] = useState(false);
  const dataMedias = checkMedias
    ? DataOrder(
        checkMedias,
        dataUser.medias.filter((i) => i[actualPage] !== false),
        isAsc
      )
    : null;
  let isCarousel;
  let isSquare;
  let isList;
  switch (visualDesing) {
    case 0:
      isCarousel = true;
      isSquare = null;
      isList = null;
      break;
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
          <Link
            to={!isOtherUser ? "/me" : `/users/${dataUser.id}`}
            className="ml-5 pt-5 text-[#b1a9fa] md:hover:text-gray-500 capitalize"
          >
            <IoIosArrowBack
              className="inline-block mr-1"
              size={25}
              alt="Left arrow icon"
            />
            {dataUser.username}
          </Link>
        </div>
        <>
          <div className="grid grid-cols-3 pr-2 ">
            {/* // . Asc/Desc */}
            <div className="col-start-2 flex items-center justify-center">
              {isAsc ? (
                <div
                  className="transition ease-in-out text-[#b1a9fa] fill-[#b1a9fa] md:hover:fill-gray-500 md:hover:text-gray-500 duration-300 cursor-pointer tracking-wide"
                  onClick={() =>
                    checkMedias && dataMedias.length ? setIsAsc(!isAsc) : null
                  }
                >
                  {t("Date Added")}
                  <HiSortAscending
                    className="ml-1 text-2xl inline-block"
                    alt={t("Ascendant")}
                  />
                </div>
              ) : (
                <div
                  className="transition ease-in-out text-[#b1a9fa] fill-[#b1a9fa] md:hover:fill-gray-500 md:hover:text-gray-500 duration-300 cursor-pointer tracking-wide"
                  onClick={() =>
                    checkMedias && dataMedias.length ? setIsAsc(!isAsc) : null
                  }
                >
                  {t("Date Added")}
                  <HiSortDescending
                    className="ml-1 text-2xl inline-block"
                    alt={t("Descending")}
                  />
                </div>
              )}
            </div>
            {/* // . BUTTONs */}
            <div className="flex items-center justify-end">
              {/* // CAROUSEL */}
              <div
                className={`mr-2 ${
                  isCarousel
                    ? "text-gray-500"
                    : "cursor-pointer text-[#b1a9fa] md:hover:text-gray-500 transition ease-in-out md:hover:scale-110 duration-200"
                }`}
              >
                <MdViewCarousel
                  className="h-14 w-14 md:h-8 md:w-8"
                  onClick={() => setVisualDesign(0)}
                />
              </div>
              {/* // SQUARE */}
              <div
                className={`mr-2 ${
                  isSquare
                    ? "text-gray-500"
                    : "cursor-pointer text-[#b1a9fa] md:hover:text-gray-500 transition ease-in-out md:hover:scale-110 duration-200"
                }`}
              >
                <BsGrid3X2GapFill
                  className="h-14 w-14 md:h-8 md:w-8"
                  onClick={() => setVisualDesign(1)}
                />
              </div>
              {/* // LIST */}
              <div
                className={`mr-2 ${
                  isList
                    ? "text-gray-500"
                    : "cursor-pointer text-[#b1a9fa] md:hover:text-gray-500 transition ease-in-out md:hover:scale-110 duration-200"
                }`}
              >
                <BsListUl
                  className="h-14 w-14 md:h-8 md:w-8"
                  onClick={() => setVisualDesign(2)}
                />
              </div>
            </div>
          </div>
              {/* // - TITLE */}
          {isCarousel ? null : (
            <div className="flex justify-between items-center">
              <div className="flex text-gray-200">
                <h1 className="pl-4 text-sm md:text-2xl uppercase">
                  {`${t(title)} ( ${
                  checkMedias && dataMedias.length ? dataMedias.length : 0
                } )` }
                </h1>
              </div>
            </div>
          )}
          {/* // - CAROUSEL */}
          {checkMedias && dataMedias.length > 0 && isCarousel ? (
            <Carousel
              title={t(title)}
              info={dataMedias}
              isUser
              setChangeSeenPending={setChangeSeenPending}
              changeSeenPending={changeSeenPending}
              isAsc={isAsc}
            />
          ) : null}
          {/* // - SQUAR */}
          {checkMedias && dataMedias.length > 0 && isSquare ? (
            <div className="my-4 grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
              {dataMedias.map((card, index) => (
                <Multi
                  key={`${index + card.id}`}
                  info={card}
                  isUser
                  setChangeSeenPending={setChangeSeenPending}
                  changeSeenPending={changeSeenPending}
                />
              ))}
            </div>
          ) : null}
          {/* // - LIST */}
          {checkMedias && dataMedias.length > 0 && isList ? (
            <div className="flex flex-col gap-1">
              {dataMedias.map((card, index) => (
                <MultiList
                  key={`${index + card.id}${card.original_title}`}
                  info={card}
                  isUser
                  setChangeSeenPending={setChangeSeenPending}
                  changeSeenPending={changeSeenPending}
                />
              ))}
            </div>
          ) : null}
        </>
      </div>
    </div>
  );
};

export default PendingsViews;
