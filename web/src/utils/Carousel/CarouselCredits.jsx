import { useEffect, useState } from "react";
import PropTypes from "prop-types";
// icons
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { GoDotFill, GoDot } from "react-icons/go";
// components
import Credits from "../../components/Credits";
import { getUserListPlaylist } from "../../../services/DB/services-db";

const CarouselCredits = ({
  title,
  id,
  info,
  media,
  isUser,
  changeSeenPending,
  setChangeSeenPending,
  isPlaylist,
  setPopSureDel,
  setIdDelete,
  isAllCards,
}) => {
  // const mediaMovie = media === "movie";
  // const mediaTv = media === "tv";
  const [currentPage, setCurrentPage] = useState(1);
  const getCardsPerPage = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 750) return 2;
    if (screenWidth < 1000) return 3;
    if (screenWidth < 1280) return 4;
    return 6;
  };
  const cardsPerPage = getCardsPerPage();
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  const [playlistUser, setPlaylistUser] = useState([]);
  const [isChange, setIsChange] = useState(false);
  useEffect(() => {     
    const DataPlaylist = async () => {
      getUserListPlaylist().then((data) => {
      setPlaylistUser(data);
      })
      .catch((err) => err);
  };
    if (isUser) {
      DataPlaylist()
      setChangeSeenPending(!changeSeenPending)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUser, isChange]);
  
  // If it is even, 2 objects are subtracted from the array. If it is odd, no subtraction is made
  const allCards =
    !isAllCards && !isUser && info.length > 6 && cardsPerPage % 2 === 0
      ? info.slice(0, -2)
      : info;
  const totalPages = Math.ceil(allCards.length / cardsPerPage);
  const startCardIndex = (currentPage - 1) * cardsPerPage;
  const visibleCards = allCards.slice(
    startCardIndex,
    startCardIndex + cardsPerPage
  );
  // Dots
  const renderPageIndicator = () => {
    const indicators = [];
    for (let i = 1; i <= totalPages; i++) {
      const icon =
        i === currentPage ? (
          <GoDotFill size={20} alt="Icon Fill Dot Page" />
        ) : (
          <GoDot size={20} alt="Icon Empty Dot Page" />
        );
      indicators.push(
        <div
          key={`carousel1${i}${media}`}
          onClick={() => setCurrentPage(i)}
          className="cursor-pointer transition ease-in-out text-[#6676a7] md:hover:scale-110 md:hover:text-gray-200 duration-300"
        >
          {icon}
        </div>
      );
    }
    return indicators;
  };

  return (
    <>
      {allCards && allCards.length > 6 ? (
        <div className="flex justify-between items-center">
          {/* // - TITLE */}
          <div className="flex text-gray-200">
            <h1 className="pl-4 text-sm md:text-2xl uppercase">{title}</h1>
            {isUser && title ? (
              <p className="ml-1 text-xs">{`( ${
                allCards.length ? allCards.length : 0
              } )`}</p>
            ) : null}
          </div>
          {/* // - BUTTONS */}
          <div className="flex">
            <div className="align-middle">
              {startCardIndex > 0 ? (
                <IoIosArrowBack
                  className="inline-block cursor-pointer transition ease-in-out text-[#6676a7] md:hover:scale-110 md:hover:text-gray-200 duration-300"
                  size={50}
                  alt="Back Icon"
                  onClick={handlePrevPage}
                />
              ) : (
                <IoIosArrowBack
                  className="inline-block text-gray-800"
                  size={50}
                  alt="Back Icon"
                  onClick={handlePrevPage}
                />
              )}
            </div>
            <div className="align-middle">
              {startCardIndex + cardsPerPage < allCards.length ? (
                <IoIosArrowForward
                  className="inline-block cursor-pointer transition ease-in-out text-[#6676a7] md:hover:scale-110 md:hover:text-gray-200 duration-300"
                  size={50}
                  alt="Before Icon"
                  onClick={handleNextPage}
                />
              ) : (
                <IoIosArrowForward
                  className="inline-block text-gray-800"
                  size={50}
                  alt="Before Icon"
                  onClick={handleNextPage}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          {/* // - TITLE */}
          <div className="flex text-gray-200">
            <h1 className="pl-4 text-sm md:text-2xl uppercase">{title}</h1>
            {isUser && title ? (
              <p className="ml-1 text-xs">{`( ${
                allCards.length ? allCards.length : 0
              } )`}</p>
            ) : null}
          </div>
        </div>
      )}
      {/* // - CARDS */}
      <div className="my-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 text-gray-200 rounded-xl justify-items-center items-start">
        {visibleCards.map((card, index) => (          
          <Credits
            key={`carrousel2${index}${media}`}
            repInfo={card}
            media={media}
            idInfo={id}
            playlistUser={playlistUser}
            // info={card}
            // mediaMovie={mediaMovie}
            // mediaTv={mediaTv}
            // isUser={isUser}
            setChangeSeenPending={setIsChange}
            changeSeenPending={isChange}
            isPlaylist={isPlaylist}
            setPopSureDel={setPopSureDel}
            setIdDelete={setIdDelete}
          />
        ))}
      </div>
      {/* // - PAGES */}
      {allCards && allCards.length > 6 ? (
        <div className="flex justify-center">{renderPageIndicator()}</div>
      ) : null}
    </>
  );
};

export default CarouselCredits;

CarouselCredits.defaultProps = {
  title: "",
  id: 0,
  info: [],
  media: "",
  isUser: false,
  changeSeenPending: false,
  setChangeSeenPending: () => {},
  isPlaylist: false,
  setPopSureDel: () => {},
  setIdDelete: () => {},
  isAllCards: false,
  playlistUser: []
};

CarouselCredits.propTypes = {
  title: PropTypes.string,
  id: PropTypes.number,
  info: PropTypes.array,
  media: PropTypes.string,
  isUser: PropTypes.bool,
  changeSeenPending: PropTypes.bool,
  setChangeSeenPending: PropTypes.func,
  isPlaylist: PropTypes.bool,
  setPopSureDel: PropTypes.func,
  setIdDelete: PropTypes.func,
  isAllCards: PropTypes.bool,
  playlistUser: PropTypes.array,
};
