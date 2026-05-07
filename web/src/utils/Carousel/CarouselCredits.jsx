import { useState } from 'react';
import PropTypes from 'prop-types';
// components
import Credits from '../../components/Credits';
import CarouselHeader from './CarouselHeader';
import CarouselDots from './CarouselDots';
import { useCarouselPagination } from './useCarouselPagination';
import { useSwipe } from './useSwipe';

const BREAKPOINTS = { sm: 2, md: 4, lg: 5, xl: 7 };

const CarouselCredits = ({
  title,
  id,
  info,
  media,
  isUser,
  isPlaylist,
  setPopSureDel,
  setIdDelete,
  isAllCards,
  size,
}) => {
  const [isChange, setIsChange] = useState(false);

  const {
    currentPage,
    allCards,
    totalPages,
    visibleCards,
    hasOverflow,
    canPrev,
    canNext,
    handleNext,
    handlePrev,
    goToPage,
  } = useCarouselPagination({
    items: info,
    breakpoints: BREAKPOINTS,
    trimTrailing: !isAllCards && !isUser,
  });

  const swipeHandlers = useSwipe({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrev,
  });

  return (
    <>
      <CarouselHeader
        title={title}
        count={allCards.length}
        showCount={isUser}
        showNav={hasOverflow}
        canPrev={canPrev}
        canNext={canNext}
        onPrev={handlePrev}
        onNext={handleNext}
        titleClassName="pl-4 text-sm md:text-2xl uppercase"
      />
      {/* // - CARDS */}
      <div
        className="my-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2 text-gray-200 rounded-xl justify-items-center items-start touch-pan-y"
        {...swipeHandlers}
      >
        {visibleCards.map((card, index) => (
          <Credits
            key={`carrousel2${index}${media}`}
            repInfo={card}
            media={media}
            idInfo={id}
            setChangeSeenPending={setIsChange}
            changeSeenPending={isChange}
            isPlaylist={isPlaylist}
            setPopSureDel={setPopSureDel}
            setIdDelete={setIdDelete}
            playlistLabelVisibility="always"
            size={size}
          />
        ))}
      </div>
      {hasOverflow ? (
        <CarouselDots
          totalPages={totalPages}
          currentPage={currentPage}
          onSelect={goToPage}
          keyPrefix={`credits-${media}`}
        />
      ) : null}
    </>
  );
};

export default CarouselCredits;

CarouselCredits.defaultProps = {
  title: '',
  id: 0,
  info: [],
  media: '',
  isUser: false,
  isPlaylist: false,
  setPopSureDel: () => {},
  setIdDelete: () => {},
  isAllCards: false,
  playlistUser: [],
  size: 'normal',
};

CarouselCredits.propTypes = {
  title: PropTypes.string,
  id: PropTypes.number,
  info: PropTypes.array,
  media: PropTypes.string,
  isUser: PropTypes.bool,
  isPlaylist: PropTypes.bool,
  setPopSureDel: PropTypes.func,
  setIdDelete: PropTypes.func,
  isAllCards: PropTypes.bool,
  playlistUser: PropTypes.array,
  size: PropTypes.oneOf(['small', 'normal']),
};
