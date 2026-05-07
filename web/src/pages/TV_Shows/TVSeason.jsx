import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getMediaDetails,
  getSeasonDetails,
} from '../../../services/TMDB/services-tmdb';
import { useTranslation } from 'react-i18next';
import NavArrowButton from '../../utils/Buttons/NavArrowButton';
import { useAuthContext } from '../../context/auth-context';
import { getDetailSeasons } from '../../../services/DB/services-db';
import { NoImage, tv } from '../../assets/image';
import DateAndTimeConvert from '../../utils/DateAndTimeConvert';
import Episodes from '../../components/TV/Episodes';
import PageTitle from '../../components/PageTitle';
import SeenPendingSeason from '../../components/MediaList/SeenPendingMedia/SeenPendingSeason';
import SeenPendingButton from '../../utils/Buttons/SeenPendingButton';

const TVSeason = () => {
  const { user, onReload } = useAuthContext();
  const userExist = !!user;
  const [t] = useTranslation('translation');
  const { idTv, NSeason } = useParams();
  const navigate = useNavigate();
  const [season, setSeason] = useState([]);
  const [tvDetails, setTV] = useState([]);
  const [changeSeenPending, setChangeSeenPending] = useState(false);
  const [pendingSeen, setPendingSeen] = useState(false);
  useEffect(() => {
    const DataTV = async () => {
      getMediaDetails('tv', idTv, t('es-ES'))
        .then((data) => {
          setTV(data);
        })
        .catch((err) => err);
    };
    if (idTv) {
      DataTV();
    }
    const DataSeason = async () => {
      getSeasonDetails(idTv, NSeason, t('es-ES'))
        .then((data) => {
          setSeason(data);
        })
        .catch((err) => err);
    };
    if (idTv && NSeason) {
      DataSeason();
    }
  }, [idTv, NSeason, t]);

  const url = season.poster_path
    ? `https://www.themoviedb.org/t/p/w300_and_h450_bestv2${season.poster_path}`
    : NoImage;
  // ! USER COMPARATIVE
  const [dataMediaUser, setDataMediaUser] = useState({});
  useEffect(() => {
    if (userExist) {
      getDetailSeasons(idTv, NSeason).then((d) => {
        setDataMediaUser(d);
      });
    }
  }, [changeSeenPending, pendingSeen, idTv, userExist, NSeason]);
  const {
    seen,
    pending,
    runtime,
    number_seasons,
    number_of_episodes,
    runtime_seasons,
    seenComplete,
  } = dataMediaUser;
  const TotalTime =
    runtime > 0
      ? new DateAndTimeConvert(runtime, t, false).TimeConvert()
      : null;

  const dataMediaSeason = dataMediaUser && seenComplete ? {} : dataMediaUser;
  //- SEEN/NO SEEN
  const handleSeenMedia = (event) => {
    event.stopPropagation();
    SeenPendingSeason(
      dataMediaSeason,
      idTv,
      'tv',
      runtime,
      runtime,
      seen,
      setChangeSeenPending,
      changeSeenPending,
      setPendingSeen,
      pendingSeen,
      'seen',
      onReload,
      NSeason,
      number_of_episodes,
      number_seasons,
      dataMediaUser.runtime_seen || 0,
      runtime_seasons,
    );
  };

  const handlePendingMedia = (event) => {
    event.stopPropagation();
    SeenPendingSeason(
      dataMediaSeason,
      idTv,
      'tv',
      runtime,
      runtime,
      pending,
      setChangeSeenPending,
      changeSeenPending,
      setPendingSeen,
      pendingSeen,
      'pending',
      onReload,
      NSeason,
      number_of_episodes,
      number_seasons,
      dataMediaUser.runtime_seen || 0,
      runtime_seasons,
    );
  };

  const dateSeason =
    season.air_date &&
    new DateAndTimeConvert(
      season.air_date,
      t,
      false,
      false,
      false,
      true,
      false,
    ).DateTimeConvert();
  //-ID EPISODE BEFORE
  const SeasonBefore =
    tvDetails.seasons &&
    tvDetails.seasons.filter(
      (seas) => seas.season_number === Number(NSeason) - 1,
    );
  //-ID EPISODE NEXT
  const SeasonAfter =
    tvDetails.seasons &&
    tvDetails.seasons.filter(
      (seas) => seas.season_number === Number(NSeason) + 1,
    );

  return (
    <div
      className="rounded-3xl bg-contain bg-center w-full h-auto my-6 static ring-2 ring-inset ring-[#20283E]"
      style={{
        backgroundImage: `url(${url})`,
      }}
    >
      <PageTitle title={`${tvDetails.name}-S${NSeason}`} />
      <div className="text-gray-200 w-auto bg-local backdrop-blur-3xl bg-[#20283E]/80 rounded-3xl">
        <div className="ml-5 pt-5 flex flex-col md:flex-row md:gap-4">
          {/* // * BACK TV SHOW */}
          <NavArrowButton
            direction="back"
            label={tvDetails.name}
            onClick={() => idTv && navigate(`/tv/${idTv}`)}
          />
          <div className="md:inline-flex flex flex-row items-center">
            {/* // * SEASON BEFORE */}
            <NavArrowButton
              direction="back"
              label={`${t('Season')} ${Number(NSeason) - 1}`}
              onClick={() => navigate(`/tv/${idTv}/${Number(NSeason) - 1}`)}
              hidden={!SeasonBefore || SeasonBefore.length === 0}
              className="text-xs md:text-sm"
            />
            {/* // MIDDLE */}
            <div className="inline-block px-2 text-gray-500">
              {SeasonBefore && SeasonBefore.length > 0
                ? tvDetails.seasons[0].season_number === 0
                  ? tvDetails.seasons.length - 1 === Number(NSeason) ||
                    tvDetails.seasons.length - 1 - NSeason ===
                      tvDetails.seasons.length - 1
                    ? null
                    : '<| |>'
                  : SeasonAfter.length === 0
                    ? tvDetails.seasons.length === NSeason ||
                      tvDetails.seasons.length - NSeason ===
                        tvDetails.seasons.length - 1
                      ? null
                      : '<| |>'
                    : null
                : null}
            </div>
            {/* // * SEASON AFTER */}
            <NavArrowButton
              direction="forward"
              label={`${t('Season')} ${Number(NSeason) + 1}`}
              onClick={() => navigate(`/tv/${idTv}/${Number(NSeason) + 1}`)}
              hidden={!SeasonAfter || SeasonAfter.length === 0}
              className="text-xs md:text-sm"
            />
          </div>
        </div>

        <div className="h-full w-full flex flex-col md:flex-row items-center md:items-start justify-start gap-4 p-2 md:p-4">
          <div className="rounded-xl">
            {season.poster_path ? (
              <img
                className="rounded-xl w-40 md:w-72 flex justify-center "
                src={url}
                alt={season.name}
              />
            ) : (
              <div className="relative flex justify-center items-center">
                <img
                  className="absolute h-24 opacity-10"
                  src={tv}
                  alt={t('Icon people')}
                />
                <img
                  className="rounded-xl flex justify-center"
                  src={url}
                  alt={t('No photo')}
                />
              </div>
            )}
            {/* // . BUTTON SEEN/UNSEEN & NO BUTTON PENDING/UNPENDING */}
            {userExist ? (
              <div className="flex flex-row items-center justify-around w-full mt-2">
                {/* //-SEEN/UNSEEN */}
                <SeenPendingButton
                  condition={seen}
                  size={20}
                  text={'Seen'}
                  handle={handleSeenMedia}
                />
                {/* //-PENDING/NO PENDING */}
                <SeenPendingButton
                  condition={pending}
                  size={17}
                  text={'Pending'}
                  handle={handlePendingMedia}
                />
              </div>
            ) : null}
          </div>
          {/* //-SEASON NAME AND DATE */}
          <div className="w-full">
            <div className="flex justify-between items-stretch pb-4">
              <div className="flex text-lg md:text-4xl items-center">
                <h1 className="font-semibold pr-2">{season.name}</h1>
                <p className="text-base md:text-xl">{`(${
                  season.episodes && season.episodes.length
                } ${t('episodes')})`}</p>
                <p className="text-xs ml-1">{TotalTime}</p>
              </div>
              {dateSeason ? <div className="text-xs">{dateSeason}</div> : null}
            </div>
            {/* //-EPISODES */}
            <div className="text-gray-200 rounded-xl w-full">
              <div className="text-lg grid grid-rows-1 justify-items-stretch">
                {season.episodes &&
                  season.episodes.map((episode, key) => {
                    return (
                      <Episodes
                        key={key}
                        info={episode}
                        idTvShow={idTv}
                        numSeason={NSeason}
                        userExist={userExist}
                        numberEpisodes={number_of_episodes}
                      />
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TVSeason;
