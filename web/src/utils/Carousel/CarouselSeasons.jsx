// components
import SeasonSingle from '../../components/TV/SeasonSingle';
import CarouselRow from './CarouselRow';

const COLUMNS =
  '[--n:2] md:[--n:4] lg:[--n:6] xl:[--n:7] 2xl:[--n:8] [--peek:0.25] [--gap:0.5rem] md:[--gap:0.75rem]';

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
}) => (
  <CarouselRow
    title={title}
    count={info.length}
    showCount
    titleClassName="pl-4 text-sm md:text-2xl uppercase"
    items={info}
    columnsClassName={COLUMNS}
    trackClassName="my-2 text-gray-200"
    getKey={(season) => season.id}
    renderItem={(season) => (
      <SeasonSingle
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
    )}
  />
);

export default CarouselSeasons;
