import { useTranslation } from 'react-i18next';
import CarouselSeasons from '../../utils/Carousel/CarouselSeasons';

export const Seasons = ({
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
  const [t] = useTranslation('translation');
  const haveData = info && info.length > 0;

  if (!haveData) return null;

  return (
    <div className="text-gray-200 px-4">
      <CarouselSeasons
        title={t('SEASONS')}
        info={info}
        idTvShow={idTvShow}
        mediaIsSeen={mediaIsSeen}
        runTime={runTime}
        setChangeSeenPending={setChangeSeenPending}
        changeSeenPending={changeSeenPending}
        numberEpisodes={numberEpisodes}
        numberSeasons={numberSeasons}
        runTimeSeasons={runTimeSeasons}
      />
    </div>
  );
};

export default Seasons;
