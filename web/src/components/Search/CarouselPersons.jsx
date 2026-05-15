// components
import Credits from '../Credits';
import CarouselHeader from '../../utils/Carousel/CarouselHeader';
import CarouselDots from '../../utils/Carousel/CarouselDots';
import { useCarouselPagination } from '../../utils/Carousel/useCarouselPagination';
import { useSwipe } from '../../utils/Carousel/useSwipe';

const SIZE_CONFIG = {
  small: {
    cardsPerPage: { sm: 3, md: 6, lg: 9, xl: 9 },
    gridClass: 'grid-cols-3 md:grid-cols-6 lg:grid-cols-9 xl:grid-cols-9',
  },
  normal: {
    cardsPerPage: { sm: 2, md: 4, lg: 8, xl: 10 },
    gridClass: 'grid-cols-2 md:grid-cols-4 lg:grid-cols-8 xl:grid-cols-10',
  },
};

const CarouselPersons = ({
  title = '',
  id = 0,
  info = [],
  media = '',
  isUser = false,
  hideSearch = () => {},
  isForum = false,
  changeSeenPending = false,
  setChangeSeenPending = () => {},
  basicForum = {},
  size = 'normal',
}) => {
  const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG.normal;
  const headerTitleClass =
    size === 'small'
      ? 'pl-4 text-sm md:text-base uppercase'
      : 'pl-4 text-sm md:text-2xl uppercase';

  const {
    currentPage,
    allCards,
    totalPages,
    cardsPerPage,
    visibleCards,
    canPrev,
    canNext,
    handleNext,
    handlePrev,
    goToPage,
  } = useCarouselPagination({
    items: info,
    breakpoints: sizeConfig.cardsPerPage,
    trimTrailing: false,
    resetKey: info,
  });

  // CarouselPersons historically shows nav arrows once allCards exceeds the
  // current page size, and dots once the list is longer than 6 items.
  const showNav = allCards.length > cardsPerPage;
  const showDots = allCards.length > 6;

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
        showNav={showNav}
        canPrev={canPrev}
        canNext={canNext}
        onPrev={handlePrev}
        onNext={handleNext}
        titleClassName={headerTitleClass}
      />
      {/* // - CARDS */}
      <div
        className={`mt-1 grid ${sizeConfig.gridClass} gap-1 text-gray-200 rounded-xl justify-items-center items-start touch-pan-y`}
        onClick={hideSearch}
        {...swipeHandlers}
      >
        {visibleCards.map((card, index) => (
          <Credits
            key={`carrousel2${index}${media}`}
            repInfo={card}
            media={media}
            idInfo={id}
            changeSeenPending={changeSeenPending}
            setChangeSeenPending={setChangeSeenPending}
            isForum={isForum}
            basicForum={basicForum}
            hideSearch={hideSearch}
            size={size}
            playlistLabelVisibility="always"
          />
        ))}
      </div>
      {showDots ? (
        <CarouselDots
          totalPages={totalPages}
          currentPage={currentPage}
          onSelect={goToPage}
          keyPrefix={`persons-${media}`}
        />
      ) : null}
    </>
  );
};

export default CarouselPersons;
