import { useState } from 'react';
// components
import Credits from '../../components/Credits';
import CarouselRow from './CarouselRow';

// Fixed-size avatars: no peek, so cards keep the old grid widths.
const COLUMNS =
  '[--n:2] md:[--n:4] lg:[--n:5] xl:[--n:7] [--peek:0] [--gap:0.5rem]';

const CarouselCredits = ({
  title = '',
  id = 0,
  info = [],
  media = '',
  isUser = false,
  isPlaylist = false,
  setPopSureDel = () => {},
  setIdDelete = () => {},
  size = 'normal',
}) => {
  const [isChange, setIsChange] = useState(false);

  return (
    <CarouselRow
      title={title}
      count={info.length}
      showCount={isUser}
      titleClassName="pl-4 text-sm md:text-2xl uppercase"
      items={info}
      columnsClassName={COLUMNS}
      trackClassName="my-4 text-gray-200"
      renderItem={(card) => (
        <Credits
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
      )}
    />
  );
};

export default CarouselCredits;
