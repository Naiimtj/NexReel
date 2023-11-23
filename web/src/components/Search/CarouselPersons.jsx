import { useState } from "react";
import PropTypes from "prop-types";
// icons
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { GoDotFill, GoDot } from "react-icons/go";
// components
import Credits from "../Credits";

const CarouselPersons = ({ title, id, info, media, isUser, ocultarSearch }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const getCardsPerPage = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 750) return 2;
    if (screenWidth < 1000) return 4;
    if (screenWidth < 1280) return 8;
    return 10;
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
  const allCards = info;
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
      {allCards && allCards.length > cardsPerPage ? (
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
      <div
        className={`mt-1 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 xl:grid-cols-10 gap-1 text-gray-200 rounded-xl justify-items-center items-start`}
        onClick={ocultarSearch}
      >
        {visibleCards.map((card, index) => (
          <Credits
            key={`carrousel2${index}${media}`}
            repInfo={card}
            media={media}
            idInfo={id}
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

export default CarouselPersons;

CarouselPersons.defaultProps = {
  title: "",
  id: 0,
  info: [],
  media: "",
  isUser: false,
  changeSeenPending: false,
  setChangeSeenPending: () => {},
  isPlaylist: "",
  setPopSureDel: () => {},
  setIdDelete: () => {},
  isAllCards: false,
  ocultarSearch: () => {},
};

CarouselPersons.propTypes = {
  title: PropTypes.string,
  id: PropTypes.number,
  info: PropTypes.array,
  media: PropTypes.string,
  isUser: PropTypes.bool,
  changeSeenPending: PropTypes.bool,
  setChangeSeenPending: PropTypes.func,
  isPlaylist: PropTypes.string,
  setPopSureDel: PropTypes.func,
  setIdDelete: PropTypes.func,
  isAllCards: PropTypes.bool,
  ocultarSearch: PropTypes.func,
};
