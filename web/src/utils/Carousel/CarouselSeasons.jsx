// components
import SeasonSingle from '../../components/TV/SeasonSingle';
import CarouselHeader from './CarouselHeader';
import CarouselDots from './CarouselDots';
import { useCarouselPagination } from './useCarouselPagination';
import { useSwipe } from './useSwipe';

const BREAKPOINTS = { sm: 2, md: 4, lg: 6, xl: 7 };

const CarouselSeasons = ({
  title = '',
  info = [],
  idTvShow = 0,
  mediaIsSeen = false,
  runTime = 0,
  setChangeSeenPending = () => {},
  changeSeenPending = false,
  numberEpisodes = 0,
  numberSeasons = 0,
  runTimeSeasons = [],
}) => {
  const {
    currentPage,
    allCards,
    totalPages,
    visibleCards,
    prefetchCards,
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
            mediaIsSeen={mediaIsSeen}
            runTime={runTime}
            setChangeSeenPending={setChangeSeenPending}
            changeSeenPending={changeSeenPending}
            numberEpisodes={numberEpisodes}
            numberSeasons={numberSeasons}
            runTimeSeasons={runTimeSeasons}
          />
        ))}
      </div>
      {prefetchCards.length > 0 && (
        <div aria-hidden="true" className="hidden">
          {prefetchCards.map((season) => (
            <SeasonSingle
              key={`prefetch-${season.id}`}
              season={season}
              idTvShow={idTvShow}
              mediaIsSeen={mediaIsSeen}
              runTime={runTime}
              setChangeSeenPending={setChangeSeenPending}
              changeSeenPending={changeSeenPending}
              numberEpisodes={numberEpisodes}
              numberSeasons={numberSeasons}
              runTimeSeasons={runTimeSeasons}
            />
          ))}
        </div>
      )}
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
