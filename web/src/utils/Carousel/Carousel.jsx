import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
// components
import Multi from '../../components/MediaList/Multi';
import { useAuthContext } from '../../context/auth-context';
import { useMediaContext } from '../../context/media-context';
import { getDetailForum } from '../../../services/DB/services-db';
import CarouselHeader from './CarouselHeader';
import CarouselDots from './CarouselDots';
import { useCarouselPagination } from './useCarouselPagination';
import { useSwipe } from './useSwipe';

const SIZE_CONFIG = {
  small: {
    cardsPerPage: { sm: 2, md: 4, lg: 6, xl: 8 },
    gridClass: 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8',
  },
  normal: {
    cardsPerPage: { sm: 2, md: 4, lg: 5, xl: 6 },
    gridClass: 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
  },
};

const Carousel = ({
  title,
  info,
  media,
  isUser,
  isPlaylist,
  setPopSureDel,
  setIdDelete,
  isAllCards,
  hideSearch,
  isForum,
  basicForum,
  isSetChange,
  isChange,
  setPendingSeenMedia,
  pendingSeenMedia,
  size,
  onTitleClick,
}) => {
  const sizeConfig = SIZE_CONFIG[size] || SIZE_CONFIG.normal;
  const headerTitleClass =
    size === 'small'
      ? 'pl-4 text-sm md:text-base uppercase'
      : 'pl-4 text-sm md:text-2xl uppercase';
  const { user } = useAuthContext();
  const userExist = !!user;
  const { mediasUser, refreshMedias } = useMediaContext();
  const hasFetchedRef = useRef(false);
  useEffect(() => {
    const Data2 = async () => {
      setPendingSeenMedia(!pendingSeenMedia);
    };
    if (userExist && isChange) {
      refreshMedias();
      hasFetchedRef.current = true;
      isSetChange(false);
    }
    if (userExist && isChange) {
      Data2();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userExist, isChange]);
  const [dataForum, setDataForum] = useState({});
  // - FORUM
  useEffect(() => {
    const ForumData = async () => {
      getDetailForum(basicForum.id).then((data) => {
        setDataForum(data);
      });
    };
    if (isForum && isChange) {
      ForumData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChange, basicForum.id, isForum]);
  const ForumData = {
    id: dataForum.id,
    title: dataForum.title,
    medias: dataForum.medias,
  };
  const mediaMovie = media === 'movie';
  const mediaTv = media === 'tv';

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
    breakpoints: sizeConfig.cardsPerPage,
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
        onTitleClick={onTitleClick}
        titleClassName={headerTitleClass}
      />
      {/* // - CARDS */}
      <div
        className={`my-2 grid ${sizeConfig.gridClass} gap-2 touch-pan-y`}
        {...swipeHandlers}
      >
        {visibleCards.map((card, index) => (
          <Multi
            key={`carrousel2${index}${media}`}
            info={card}
            mediaMovie={mediaMovie}
            mediaTv={mediaTv}
            isUser={isUser}
            setChangeSeenPending={isSetChange}
            changeSeenPending={isChange}
            isPlaylist={isPlaylist}
            setPopSureDel={setPopSureDel}
            setIdDelete={setIdDelete}
            hideSearch={hideSearch}
            isForum={isForum}
            basicForum={ForumData}
            mediasUser={mediasUser}
            size={size}
          />
        ))}
      </div>
      {hasOverflow ? (
        <CarouselDots
          totalPages={totalPages}
          currentPage={currentPage}
          onSelect={goToPage}
          keyPrefix={`carousel-${media}`}
        />
      ) : null}
    </>
  );
};

export default Carousel;

Carousel.defaultProps = {
  title: '',
  info: [],
  media: '',
  isUser: false,
  isChange: false,
  isSetChange: () => {},
  isPlaylist: '',
  setPopSureDel: () => {},
  setIdDelete: () => {},
  isAllCards: false,
  hideSearch: () => {},
  basicForum: {},
  isForum: false,
  setPendingSeenMedia: () => {},
  pendingSeenMedia: false,
  size: 'normal',
  onTitleClick: undefined,
};

Carousel.propTypes = {
  title: PropTypes.string,
  info: PropTypes.array,
  media: PropTypes.string,
  isUser: PropTypes.bool,
  isChange: PropTypes.bool,
  isSetChange: PropTypes.func,
  isPlaylist: PropTypes.string,
  setPopSureDel: PropTypes.func,
  setIdDelete: PropTypes.func,
  isAllCards: PropTypes.bool,
  hideSearch: PropTypes.func,
  basicForum: PropTypes.object,
  isForum: PropTypes.bool,
  setPendingSeenMedia: PropTypes.func,
  pendingSeenMedia: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'normal']),
  onTitleClick: PropTypes.func,
};
