import PropTypes from 'prop-types';
// components
import SeasonSingle from '../../components/TV/SeasonSingle';
import CarouselHeader from './CarouselHeader';
import CarouselDots from './CarouselDots';
import { useCarouselPagination } from './useCarouselPagination';
import { useSwipe } from './useSwipe';

const BREAKPOINTS = { sm: 2, md: 4, lg: 6, xl: 7 };

const CarouselSeasons = ({
  title,
  info,
  idTvShow,
  mediaIsPending,
  mediaIsSeen,
  runTime,
  setChangeSeenPending,
  changeSeenPending,
  numberEpisodes,
  numberSeasons,
  runtime_seen,
  runTimeSeasons,
}) => {
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
    trimTrailing: false,
    resetKey: info,
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
        showCount
        showNav={hasOverflow}
        canPrev={canPrev}
        canNext={canNext}
        onPrev={handlePrev}
        onNext={handleNext}
        titleClassName="pl-4 text-sm md:text-2xl uppercase"
      />
      {/* // - SEASONS */}
      <div
        className="my-2 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-1 md:pt-4 md:px-4 text-gray-200 touch-pan-y"
        {...swipeHandlers}
      >
        {visibleCards.map((season) => (
          <SeasonSingle
            key={season.id}
            season={season}
            idTvShow={idTvShow}
            mediaIsPending={mediaIsPending}
            mediaIsSeen={mediaIsSeen}
            runTime={runTime}
            setChangeSeenPending={setChangeSeenPending}
            changeSeenPending={changeSeenPending}
            numberEpisodes={numberEpisodes}
            numberSeasons={numberSeasons}
            runtime_seen={runtime_seen}
            runTimeSeasons={runTimeSeasons}
          />
        ))}
      </div>
      {hasOverflow ? (
        <CarouselDots
          totalPages={totalPages}
          currentPage={currentPage}
          onSelect={goToPage}
          keyPrefix={`seasons-${idTvShow}`}
        />
      ) : null}
    </>
  );
};

export default CarouselSeasons;

CarouselSeasons.defaultProps = {
  title: '',
  info: [],
  idTvShow: 0,
  mediaIsPending: false,
  mediaIsSeen: false,
  runTime: 0,
  setChangeSeenPending: () => {},
  changeSeenPending: false,
  numberEpisodes: 0,
  numberSeasons: 0,
  runtime_seen: 0,
  runTimeSeasons: [],
};

CarouselSeasons.propTypes = {
  title: PropTypes.string,
  info: PropTypes.array,
  idTvShow: PropTypes.number,
  mediaIsPending: PropTypes.bool,
  mediaIsSeen: PropTypes.bool,
  runTime: PropTypes.number,
  setChangeSeenPending: PropTypes.func,
  changeSeenPending: PropTypes.bool,
  numberEpisodes: PropTypes.number,
  numberSeasons: PropTypes.number,
  runtime_seen: PropTypes.number,
  runTimeSeasons: PropTypes.array,
};
