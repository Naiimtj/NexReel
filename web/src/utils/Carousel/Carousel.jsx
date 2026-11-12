import { useEffect, useRef, useState } from 'react';
// components
import Multi from '../../components/MediaList/Multi';
import { useAuthContext } from '../../context/auth-context';
import { useMediaContext } from '../../context/media-context';
import { getDetailForum } from '../../../services/DB/services-db';
import CarouselRow from './CarouselRow';

// Cards per view (--n) by breakpoint, peek of the next card and gap; see CarouselRow.
const COLUMNS_BY_SIZE = {
  small:
    '[--n:2] md:[--n:4] lg:[--n:6] xl:[--n:8] [--peek:0.25] [--gap:0.5rem] md:[--gap:0.75rem]',
  normal:
    '[--n:2] md:[--n:4] lg:[--n:5] xl:[--n:6] [--peek:0.25] [--gap:0.5rem] md:[--gap:0.75rem]',
};

const Carousel = ({
  title = '',
  info = [],
  media = '',
  isUser = false,
  isPlaylist = '',
  setPopSureDel = () => {},
  setIdDelete = () => {},
  hideSearch = () => {},
  isForum = false,
  basicForum = {},
  isSetChange = () => {},
  isChange = false,
  setPendingSeenMedia = () => {},
  pendingSeenMedia = false,
  size = 'normal',
  onTitleClick = undefined,
  onEndReached = undefined,
}) => {
  const columnsClass = COLUMNS_BY_SIZE[size] || COLUMNS_BY_SIZE.normal;
  const headerTitleClass =
    size === 'small'
      ? 'pl-4 text-sm md:text-base uppercase'
      : 'pl-4 text-base md:text-2xl uppercase';
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
  }, [isChange, basicForum.id, isForum]);
  const ForumData = {
    id: dataForum.id,
    title: dataForum.title,
    medias: dataForum.medias,
  };
  const mediaMovie = media === 'movie';
  const mediaTv = media === 'tv';

  return (
    <CarouselRow
      title={title}
      count={info.length}
      showCount={isUser}
      onTitleClick={onTitleClick}
      titleClassName={headerTitleClass}
      items={info}
      columnsClassName={columnsClass}
      trackClassName="my-2"
      onEndReached={onEndReached}
      renderItem={(card) => (
        <Multi
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
      )}
    />
  );
};

export default Carousel;
