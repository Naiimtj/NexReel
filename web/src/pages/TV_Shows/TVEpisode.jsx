import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// services
import {
  getEpisodeDetails,
  getMediaDetails,
  getSeasonDetails,
} from '../../../services/TMDB/services-tmdb';
import { getDetailEpisode } from '../../../services/DB/services-db';
// img
import { NoImageEpis } from '../../assets/image';
import NavArrowButton from '../../utils/Buttons/NavArrowButton';
// components
import DateAndTimeConvert from '../../utils/DateAndTimeConvert';
import { useAuthContext } from '../../context/auth-context';
import CarouselCredits from '../../utils/Carousel/CarouselCredits';
import PageTitle from '../../components/PageTitle';
import SeenPendingEpisode from '../../components/MediaList/SeenPendingMedia/SeenPendingEpisode';
import SeenPendingButton from '../../utils/Buttons/SeenPendingButton';
import CreditList from '../../components/MediaList/Details/CreditList';

const TVEpisode = () => {
  const [t] = useTranslation('translation');
  const { user, onReload } = useAuthContext();
  const userExist = !!user;
  const { idTv, NSeason, idEpisode } = useParams();
  const navigate = useNavigate();
  const [season, setSeason] = useState([]);
  const [episode, setEpisode] = useState([]);
  const [tvDetails, setTvDetails] = useState([]);
  const [changeSeenPending, setChangeSeenPending] = useState(false);
  const [pendingSeen, setPendingSeen] = useState(false);
  const [overviewExpanded, setOverviewExpanded] = useState(false);
  useEffect(() => {
    const DataTV = async () => {
      getMediaDetails('tv', idTv, t('es-ES'))
        .then((data) => {
          setTvDetails(data);
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
    const DataEpisode = async () => {
      getEpisodeDetails(idTv, NSeason, idEpisode, t('es-ES'))
        .then((data) => {
          setEpisode(data);
        })
        .catch((err) => err);
    };
    if (idTv && NSeason && idEpisode) {
      DataEpisode();
    }
  }, [idTv, NSeason, idEpisode, t]);

  // ! USER COMPACTION
  const [dataMediaUser, setDataMediaUser] = useState({});
  useEffect(() => {
    if (userExist) {
      getDetailEpisode(idTv, NSeason, idEpisode).then((d) => {
        setDataMediaUser(d);
      });
    }
  }, [changeSeenPending, pendingSeen, idTv, NSeason, idEpisode, userExist]);
  const { seen } = dataMediaUser;
  //- SEEN/NO SEEN
  const handleSeenMedia = () => {
    SeenPendingEpisode(
      dataMediaUser,
      idTv,
      'tv',
      episode.runtime || tvDetails.episode_run_time?.[0] || 0,
      seen,
      setChangeSeenPending,
      changeSeenPending,
      setPendingSeen,
      pendingSeen,
      onReload,
      NSeason,
      idEpisode,
      season.episodes?.length || 0,
    );
  };
  const url = episode.still_path
    ? `https://image.tmdb.org/t/p/w500${episode.still_path}`
    : null;
  const dateSeason =
    episode.air_date &&
    new DateAndTimeConvert(
      episode.air_date,
      t,
      false,
      false,
      false,
      true,
      false,
    ).DateTimeConvert();
  //-FILTROS
  const directed = episode?.crew?.filter(
    (crew) => crew.department === 'Directing',
  );
  const written = episode?.crew?.filter(
    (crew) => crew.department === 'Writing',
  );

  const backgroundImageUrl = episode.still_path
    ? `url(https://image.tmdb.org/t/p/original${episode.still_path})`
    : null;

  return (
    <div>
      <PageTitle title={`${episode.name}`} />
      <div
        className="rounded-3xl bg-contain bg-center bg-fixed w-auto h-auto mt-6 mb-20 ring-2 ring-inset ring-[#20283E]"
        style={{
          backgroundImage: backgroundImageUrl,
        }}
      >
        <div className="text-gray-200 w-auto bg-local backdrop-blur-3xl bg-[#20283E]/80 rounded-3xl">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center pt-5 ml-5">
            <div className="flex flex-row gap-4 items-center">
              {/* //. BACK TV SHOW */}
              <NavArrowButton
                direction="back"
                label={tvDetails.name ?? ''}
                hidden={!tvDetails.name}
                onClick={() => navigate(`/tv/${idTv}`)}
              />
              {/* //. BACK SEASON */}
              <NavArrowButton
                direction="back"
                label={`${t('Season')} ${NSeason}`}
                onClick={() => navigate(`/tv/${idTv}/${NSeason}`)}
              />
            </div>

            <div className="flex flex-row items-center">
              {/* //. PREVIOUS EPISODE */}
              <NavArrowButton
                direction="back"
                label={
                  episode.episode_number > 1
                    ? `${t('Episode')} ${episode.episode_number - 1}`
                    : ''
                }
                onClick={() =>
                  navigate(
                    `/tv/${idTv}/${NSeason}/${episode.episode_number - 1}`,
                  )
                }
                hidden={
                  !episode.episode_number ||
                  episode.episode_number <= 1 ||
                  (season.episodes &&
                    season.episodes.length - episode.episode_number ===
                      season.episodes &&
                    season.episodes.length - 1)
                }
                className="text-xs md:text-sm"
              />
              <div className="px-2 text-gray-500 text-xs md:text-sm">
                {!episode.episode_number ||
                episode.episode_number <= 1 ||
                (season.episodes &&
                  season.episodes.length - episode.episode_number ===
                    season.episodes &&
                  season.episodes.length - 1)
                  ? null
                  : '<| |>'}
              </div>
              {/* //. NEXT EPISODE */}
              <NavArrowButton
                direction="forward"
                label={
                  episode.episode_number
                    ? `${t('Episode')} ${episode.episode_number + 1}`
                    : ''
                }
                onClick={() =>
                  navigate(
                    `/tv/${idTv}/${NSeason}/${episode.episode_number + 1}`,
                  )
                }
                hidden={
                  !episode.episode_number ||
                  (season.episodes &&
                    season.episodes.length === episode.episode_number)
                }
                className="text-xs md:text-sm"
              />
            </div>
          </div>

          {/* // - EPISODE INFO */}
          <div className="h-full w-full p-2 md:pt-4 md:px-8 mt-6">
            <div className="flex flex-col justify-center items-center">
              <img
                className="w-auto rounded-xl px-auto"
                src={url === null ? NoImageEpis : url}
                alt={season.name}
              />
              {/* // . BUTTON SEEN/UNSEEN */}
              {userExist ? (
                <div className="flex flex-row gap-10 items-center justify-around mt-2">
                  <div className="text-center align-middle">
                    <SeenPendingButton
                      condition={seen}
                      size={20}
                      text="Seen"
                      handle={handleSeenMedia}
                    />
                  </div>
                </div>
              ) : null}
              {/* //-EPISODE NAME*/}
              <h1 className="font-semibold text-3xl my-2">{episode.name}</h1>
            </div>
            {/* //- EPISODE NAME Y Nº EPISODE */}
            <p className="text-gray-500">
              {season.name} / {'Episode '}
              {episode.episode_number}
            </p>
            {/* //- SEASON DATA AND SYNOPSIS */}
            <div className="text-gray-200 rounded-xl mb-4 w-full">
              <div className="text-lg">
                <div className="text-xs text-right text-gray-400">
                  {t('Issued')}: {dateSeason}
                </div>
                {/* Synopsis */}
                <div className="py-4">
                  <div
                    className={`${
                      overviewExpanded ? '' : 'line-clamp-2'
                    } md:line-clamp-none font-extralight text-sm md:text-base`}
                  >
                    {episode.overview === ''
                      ? t('No Information')
                      : episode.overview}
                  </div>
                  {episode.overview && (
                    <button
                      type="button"
                      className="md:hidden mt-1 text-xs text-purpleNR cursor-pointer hover:text-gray-400 transition duration-300"
                      onClick={() => setOverviewExpanded((v) => !v)}
                    >
                      {overviewExpanded ? t('Read less') : t('Read more')}
                    </button>
                  )}
                </div>
              </div>
            </div>
            {/* //-DIRECTED BY */}
            <CreditList
              label={t('DIRECTED BY')}
              items={directed}
              containerClassName="flex flex-row text-sm mb-4"
            />
            {/* //-WRITTEN BY */}
            <CreditList
              label={t('WRITTEN BY')}
              items={written}
              containerClassName="flex flex-row text-sm mb-4"
            />
            {/* //-REPARTO PRINCIPAL */}
            {episode?.guest_stars?.length ? (
              <div className="text-gray-200 rounded-xl">
                <CarouselCredits
                  title={t('MAIN CAST')}
                  info={episode.guest_stars}
                  media={'tv'}
                  id={Number(idTv)}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TVEpisode;
