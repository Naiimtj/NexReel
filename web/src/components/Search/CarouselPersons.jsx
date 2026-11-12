// components
import Credits from '../Credits';
import CarouselRow from '../../utils/Carousel/CarouselRow';

// Fixed-size avatars: no peek, so cards keep the old grid widths.
const COLUMNS_BY_SIZE = {
  small: '[--n:3] md:[--n:6] lg:[--n:9] [--peek:0] [--gap:0.25rem]',
  normal:
    '[--n:2] md:[--n:4] lg:[--n:8] xl:[--n:10] [--peek:0] [--gap:0.25rem]',
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
  const columnsClass = COLUMNS_BY_SIZE[size] || COLUMNS_BY_SIZE.normal;
  const headerTitleClass =
    size === 'small'
      ? 'pl-4 text-sm md:text-base uppercase'
      : 'pl-4 text-sm md:text-2xl uppercase';

  return (
    <CarouselRow
      title={title}
      count={info.length}
      showCount={isUser}
      titleClassName={headerTitleClass}
      items={info}
      columnsClassName={columnsClass}
      trackClassName="mt-1 text-gray-200"
      onTrackClick={hideSearch}
      renderItem={(card) => (
        <Credits
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
      )}
    />
  );
};

export default CarouselPersons;
