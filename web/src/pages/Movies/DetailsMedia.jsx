import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/auth-context';
// services
import {
  getKeyWords,
  getMediaDetailsEN,
  getSeasonDetails,
  getTrailer,
  getWatchList,
} from '../../../services/TMDB/services-tmdb';
import { getRating } from '../../../services/IMDB/services-imdb';
import { getUser } from '../../../services/DB/services-db';
// img
import {
  NoImage,
  TMDB,
  IMDB,
  FILMA,
  movie,
  tv,
  PLEX,
} from '../../assets/image';
import { BsFillCaretDownFill, BsFillCaretUpFill } from 'react-icons/bs';
import { BiSolidRightArrow } from 'react-icons/bi';
// components & utils
import { BaseButton, BaseIcon } from '../../components/base';
import BaseModal from '../../components/base/BaseModal';
import KeyWords from '../../components/MediaList/KeyWords';
import Collections from '../../components/Movie/Collections';
import Rating from '../../components/MediaList/Rating/Rating';
import CarouselCredits from '../../utils/Carousel/CarouselCredits';
import Similar from '../../components/MediaList/Similar';
import Recommendations from '../../components/MediaList/Recommendations';
import CountryFlag from '../../components/CountryFlag';
import Certification from '../../components/MediaList/Certification/Certification';
import DateAndTimeConvert from '../../utils/DateAndTimeConvert';
import calculateAverageVote from '../../components/MediaList/calculateAverageVote';
import Seasons from '../../components/TV/Seasons';
import PageTitle from '../../components/PageTitle';
import SeenPending from '../../components/MediaList/SeenPendingMedia/SeenPending';
import Repeat from '../../components/MediaList/Repeat';
import ShowPlaylistMenu from '../../utils/Playlists/ShowPlaylistMenu';
import SeenPendingButton from '../../utils/Buttons/SeenPendingButton';
import RepeatSeenButton from '../../utils/Buttons/RepeatSeenButton';
import ProvidersSection, {
  ProviderLogo,
} from '../../components/MediaList/Details/ProvidersSection';
import ExternalRating from '../../components/MediaList/Details/ExternalRating';
import CreditList from '../../components/MediaList/Details/CreditList';
import usePlexMatch from '../../components/MediaList/Details/usePlexMatch';

const uniqueById = (list, limit) => {
  const seen = new Map();
  for (const item of list) if (!seen.has(item.id)) seen.set(item.id, item);
  return Array.from(seen.values()).slice(0, limit);
};

const pickEpisodeRuntime = (ep) => ep?.runtime;
const isPositiveRuntime = (r) => Number.isFinite(r) && r > 0;
const sumRuntimes = (a, b) => a + b;

const computeSeasonAverageRuntime = (episodes) => {
  const runtimes = (episodes || [])
    .map(pickEpisodeRuntime)
    .filter(isPositiveRuntime);
  if (runtimes.length === 0) return 0;
  const first = runtimes[0];
  if (runtimes.every((r) => r === first)) return first;
  return Math.round(runtimes.reduce(sumRuntimes, 0) / runtimes.length);
};

function DetailsMedia({
  info,
  crews,
  cast,
  mediaType,
  dataMediaUser,
  setChangeSeenPending,
  changeSeenPending,
}) {
  const [t, i18next] = useTranslation('translation');
  const { user, onReload } = useAuthContext();
  const userExist = !!user;
  const {
    // .Movie
    title,
    original_title,
    poster_path,
    vote_average,
    release_date,
    genres,
    overview,
    runtime,
    production_companies,
    production_countries,
    imdb_id,
    belongs_to_collection,
    // .tv
    name,
    first_air_date,
    last_air_date,
    episode_run_time,
    original_name,
    origin_country,
    number_of_episodes,
    number_of_seasons,
    created_by,
    next_episode_to_air,
    status,
    seasons,
    // .Default
    id,
  } = info;
  const [dataUser, setDataUser] = useState({});
  const [runtimeSeason, setSeason] = useState({});
  useEffect(() => {
    const DataSeason = async () => {
      getSeasonDetails(id, 1)
        .then((data) => {
          setSeason({ 0: computeSeasonAverageRuntime(data?.episodes) });
        })
        .catch((err) => err);
    };
    if (id && mediaType === 'tv') {
      DataSeason();
    }
  }, [id, mediaType]);
  useEffect(() => {
    const Data = async () => {
      getUser()
        .then((data) => {
          setDataUser(data);
        })
        .catch((err) => err);
    };
    if (userExist && !dataUser?.id) {
      Data();
    }
  }, [userExist, dataUser]);
  // SCROLL UP
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Language Selected
  const [langApi, setLangApi] = useState('es-ES');
  const [langTrailer, setLangTrailer] = useState('es-ES'); // if much probably have trailer in english compared of another language
  useEffect(() => {
    setLangApi(i18next.language);
    setLangTrailer(i18next.language);
  }, [i18next]);

  // ! SERVICES
  const [detailsWatchList, setDetailsWatchList] = useState({});
  const [trailerListData, setTrailerListData] = useState([]);
  const [tmbdEnApi, setTmbdEnApi] = useState({});
  const [wordsKeyData, setWordsKeyData] = useState({});
  useEffect(() => {
    if ((langApi, mediaType, id)) {
      getWatchList(mediaType, id, langApi).then((data) => {
        setDetailsWatchList(data.results);
      });
      getMediaDetailsEN(mediaType, id, langApi).then((data) => {
        setTmbdEnApi(data);
      });
      getKeyWords(mediaType, id, langApi).then((data) => {
        setWordsKeyData(data);
      });
    }
  }, [langApi, id, mediaType]);
  useEffect(() => {
    if ((langTrailer, mediaType, id)) {
      getTrailer(mediaType, id, langTrailer).then((data) => {
        setTrailerListData(data.results);
      });
    }
  }, [langTrailer, id, mediaType]);
  // - KEYWORDS
  const [modalKeywords, setModalKeywords] = useState(false);
  const [wordsKey, setWordsKey] = useState(null);
  useEffect(() => {
    if (Object.keys(wordsKeyData).length > 0) {
      const wordsKey =
        mediaType === 'movie' ? wordsKeyData.keywords : wordsKeyData.results;
      setWordsKey(wordsKey);
    }
  }, [mediaType, wordsKeyData]);
  // -API IMDB y Filmafinity
  const [imdbList, setImdbList] = useState({});
  useEffect(() => {
    if (langApi && imdb_id) {
      getRating(imdb_id, langApi).then((data) => {
        setImdbList(data);
      });
    }
  }, [langApi, imdb_id]);
  // - SERVICES PLEX
  const plexFriend = dataUser?.id ? dataUser.isPlexFriend : user?.isPlexFriend;
  const isInPlex = usePlexMatch({
    enabled: !!(userExist && plexFriend),
    mediaType,
    id,
    imdbId: imdb_id,
    originalTitle: original_title || original_name,
    title: title || name,
    releaseDate: release_date || first_air_date,
  });
  // -VER TRAILER
  const [modal, setModal] = useState(false);
  const handleVerTrailer = () => {
    setModal(true);
  };
  const [pendingSeen, setPendingSeen] = useState(false);
  const [repeating, setRepeating] = useState(false);
  const { seen, pending, repeat, runtime_seen } = dataMediaUser;
  const [errorAddPlaylists, setErrorAddPlaylists] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [crewExpanded, setCrewExpanded] = useState(false);
  const [showExternalRatings, setShowExternalRatings] = useState(false);
  const externalRatingsRef = useRef(null);

  useEffect(() => {
    if (!showExternalRatings) return undefined;
    const handleClickOutside = (event) => {
      if (
        externalRatingsRef.current &&
        !externalRatingsRef.current.contains(event.target)
      ) {
        setShowExternalRatings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExternalRatings]);

  useEffect(() => {
    if (!errorAddPlaylists) return undefined;
    const timerId = window.setTimeout(() => setErrorAddPlaylists(false), 3000);
    return () => clearTimeout(timerId);
  }, [errorAddPlaylists]);

  // -MAIN CAST
  const size = 20;
  const items = cast && cast.slice(0, size);
  // Check if type trailer and change language
  const trailer =
    trailerListData?.length > 0 &&
    trailerListData.filter((crew) => crew.type === 'Trailer');
  // -POSTER URL
  const url = poster_path
    ? `https://www.themoviedb.org/t/p/w300_and_h450_bestv2${poster_path}`
    : null;
  const processInfo = {};
  processInfo.poster = url || NoImage;
  processInfo.mediaType = mediaType === 'movie' ? 'Movie' : 'TV Show';
  processInfo.title = title || name;
  processInfo.titleVOSE = original_title || original_name;
  processInfo.genre = genres || [];
  processInfo.productCompany = production_companies || [];
  processInfo.runTime =
    mediaType === 'movie'
      ? runtime
      : (runtimeSeason[0] ?? episode_run_time?.[0] ?? 0);
  processInfo.TimeHM =
    runtime > 0 && !episode_run_time
      ? new DateAndTimeConvert(processInfo.runTime, t, false).TimeConvert()
      : processInfo.runTime && processInfo.runTime
        ? `${processInfo.runTime} min.`
        : null;
  processInfo.numSeason = number_of_seasons;
  processInfo.numEpis = number_of_episodes;
  processInfo.voteTMDB =
    vote_average > 0 ? Math.round(vote_average * 10) / 10 : 0;
  processInfo.voteIMDB =
    imdbList.IMDb?.audience?.rating > 0
      ? Number(imdbList.IMDb.audience.rating)
      : null;
  processInfo.voteFILMA =
    imdbList.FilmAffinity?.audience?.rating > 0
      ? Number(imdbList.FilmAffinity.audience.rating)
      : null;
  processInfo.voteAverage = calculateAverageVote(
    processInfo.voteTMDB,
    processInfo.voteIMDB,
    processInfo.voteFILMA,
  );
  processInfo.countries = production_countries || origin_country;
  processInfo.description = overview || tmbdEnApi.overview || '';
  processInfo.date =
    release_date || first_air_date
      ? new Date(release_date || first_air_date).getFullYear()
      : null;
  processInfo.LastAirDate = last_air_date
    ? new DateAndTimeConvert(
        last_air_date,
        t,
        false,
        false,
        false,
        true,
        false,
      ).DateTimeConvert()
    : null;
  processInfo.NextEpAir =
    next_episode_to_air && next_episode_to_air.air_date
      ? new DateAndTimeConvert(
          next_episode_to_air.air_date,
          t,
          false,
          false,
          false,
          true,
          false,
        ).DateTimeConvert()
      : null;
  processInfo.yearRelease =
    (release_date || first_air_date) &&
    new DateAndTimeConvert(
      release_date || first_air_date,
      t,
      false,
      false,
      false,
      true,
    ).DateTimeConvert();
  processInfo.collection = belongs_to_collection;
  processInfo.runTimeSeasons =
    mediaType === 'tv' && seasons
      ? seasons.map((season) => season.episode_count * processInfo.runTime)
      : [];
  if (mediaType === 'tv' && processInfo.runTimeSeasons.length > 0) {
    // TMDB: `number_of_seasons` excludes "Season 0" (Specials), but the
    // `seasons` array includes it. So if lengths differ, specials exist and
    // we must skip index 0 when summing the marathon time.
    processInfo.haveSpecialSeason =
      number_of_seasons !== processInfo.runTimeSeasons.length;
    processInfo.totalRunTime = 0;
    for (
      let i = processInfo.haveSpecialSeason ? 1 : 0;
      i < processInfo.runTimeSeasons.length;
      i++
    ) {
      const seasonRuntime = processInfo.runTimeSeasons[i];
      if (Number.isFinite(seasonRuntime)) {
        processInfo.totalRunTime += seasonRuntime;
      }
    }
    processInfo.TotalTimeMarathon =
      processInfo.totalRunTime > 0
        ? new DateAndTimeConvert(
            processInfo.totalRunTime,
            t,
            false,
          ).TimeConvert()
        : 0;
  } else {
    processInfo.TotalTimeMarathon = 0;
  }

  processInfo.TotalTimeSeen =
    mediaType === 'tv' && Number.isFinite(runtime_seen) && runtime_seen > 0
      ? new DateAndTimeConvert(
          // Clamp to marathon total so a stale/over-accumulated value
          // never displays more time seen than the series total.
          processInfo.totalRunTime > 0
            ? Math.min(runtime_seen, processInfo.totalRunTime)
            : runtime_seen,
          t,
          false,
        ).TimeConvert()
      : 0;

  const watch = detailsWatchList?.ES || {};
  processInfo.watchingBuy = watch.buy || null;
  processInfo.watching = watch.flatrate || null;
  processInfo.streaming = isInPlex || processInfo.watching ? true : null;
  processInfo.watchingFree = watch.free || null;
  processInfo.watchingAds = watch.ads || null;

  processInfo.NoWatch =
    processInfo.streaming === null &&
    processInfo.watchingFree === null &&
    processInfo.watchingAds === null &&
    processInfo.watchingBuy === null
      ? null
      : t('Available');

  processInfo.trailer = trailer?.[0]?.key || null;
  processInfo.status = mediaType === 'tv' ? status : null;

  const byDept = (dept) => crews.filter((crew) => crew.department === dept);
  const directingAll = byDept('Directing');
  const writersAll = byDept('Writing');
  const productionsAll = byDept('Production');
  const uniqueWriters = uniqueById(writersAll, 6);
  const uniqueDirecting = uniqueById(directingAll, 3);
  const uniqueProductions = uniqueById(productionsAll, 5);
  const createdByList = (created_by || []).slice(0, 5);

  const typeCountryStatusBlock = (
    <div className="flex md:flex-col gap-2 md:gap-0 items-end">
      {/* // . Type and Country */}
      <div className="flex flex-row items-center gap-1 text-xs capitalize text-right">
        {t(processInfo.mediaType)}
        {/* Flag Country */}
        {processInfo.countries?.map((county, index) => {
          const code = typeof county === 'string' ? county : county.iso_3166_1;
          if (!code) return null;
          return (
            <CountryFlag
              key={`${code}-${index}`}
              code={code}
              className="text-xl align-middle"
            />
          );
        })}
      </div>
      <Certification
        info={processInfo.countries}
        media={mediaType}
        id={id}
        lang={langApi}
      />
      {processInfo.status ? (
        <div>
          {processInfo.status === 'Returning Series' ? (
            <div className="text-xs text-green-700 capitalize">
              {t(processInfo.status)}
            </div>
          ) : (
            <div className="text-xs text-red-700 capitalize">
              {t(processInfo.status)}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );

  const CaretIcon = modalKeywords ? BsFillCaretUpFill : BsFillCaretDownFill;
  const keywordsGenre = (
    <div>
      <button
        type="button"
        className="pt-2 cursor-pointer text-left text-sm  px:center text-purpleNR transition ease-in-out md:hover:text-gray-400 duration-300"
        onClick={() => setModalKeywords(!modalKeywords)}
      >
        {t('Key Words')}
        <CaretIcon
          className="inline-block align-middle ml-1"
          size={16}
          alt={t(modalKeywords ? 'Close Keywords' : 'Open Keywords')}
        />
      </button>
      {modalKeywords && (
        <KeyWords wordsKey={wordsKey} media={mediaType} id={id} />
      )}
    </div>
  );

  //- SEEN/NO SEEN
  const handleSeenMedia = (event) => {
    event.stopPropagation();
    SeenPending(
      dataMediaUser,
      id,
      mediaType,
      processInfo.runTime,
      seen,
      setChangeSeenPending,
      changeSeenPending,
      setPendingSeen,
      pendingSeen,
      'seen',
      onReload,
      number_of_episodes,
      number_of_seasons,
      processInfo.runTimeSeasons,
      processInfo.totalRunTime,
    );
  };
  // - PENDING/NO PENDING
  const handlePending = (event) => {
    event.stopPropagation();
    SeenPending(
      dataMediaUser,
      id,
      mediaType,
      processInfo.runTime,
      pending,
      setChangeSeenPending,
      changeSeenPending,
      setPendingSeen,
      pendingSeen,
      'pending',
      onReload,
      number_of_episodes,
      number_of_seasons,
      processInfo.runTimeSeasons,
      processInfo.totalRunTime,
    );
  };

  // - REPEAT SEEN/NO REPEAT SEEN
  const handleRepeatSeen = (event) => {
    event.stopPropagation();
    Repeat(
      dataMediaUser,
      id,
      mediaType,
      processInfo.runTime,
      seen,
      pending,
      repeat,
      setChangeSeenPending,
      changeSeenPending,
      setRepeating,
      repeating,
      onReload,
    );
  };

  const getIconImage = () => {
    if (mediaType === 'movie') {
      return movie;
    } else if (mediaType === 'tv') {
      return tv;
    } else {
      return null;
    }
  };

  const iconImage = getIconImage();

  const poster = poster_path ? (
    <img
      className="rounded-xl w-52 md:w-full sm:w-auto justify-self-center"
      src={processInfo.poster}
      alt={name}
    />
  ) : (
    <div className="relative flex justify-center items-center">
      <img
        className="absolute h-24 opacity-10"
        src={iconImage}
        alt={t('Icon people')}
      />
      <img
        className="rounded-xl w-52 md:w-full sm:w-auto justify-self-center"
        src={processInfo.poster}
        alt={name}
      />
    </div>
  );

  const streamingOrWatchProviders = (
    <div className="flex flex-col gap-2">
      {/* //-WHERE SEE OR BUY */}
      <div className="md:text-right text-xs md:text-base text-gray-400">
        {processInfo.NoWatch === null ? t('Not Available') : null}
        {/* // STREAM */}
        {processInfo.streaming ? t('Stream') : null}
        <div className="mt-1">
          {isInPlex ? (
            <img
              className="inline-block h-5 md:h-7 justify-self-center mr-0.5 rounded-md md:rounded-lg border-[1px] border-amber-400/40"
              src={PLEX}
              alt={'Plex Icon'}
            />
          ) : null}
          {processInfo.watching?.map((p, i) => (
            <ProviderLogo
              key={`flatrate-${p.provider_id ?? p.provider_name}-${i}`}
              provider={p}
            />
          ))}
          {processInfo.watchingAds?.map((p, i) => (
            <ProviderLogo
              key={`ads-${p.provider_id ?? p.provider_name}-${i}`}
              provider={p}
            />
          ))}
        </div>
      </div>
      <ProvidersSection label={t('Buy')} providers={processInfo.watchingBuy} />
      <ProvidersSection
        label={t('Free')}
        providers={processInfo.watchingFree}
      />
    </div>
  );

  const mediaDate = processInfo.date ? (
    <span className="absolute ml-1 text-xs md:text-sm font-normal">
      {`(${processInfo.date})`}
    </span>
  ) : null;

  const isTmdbOnly = !processInfo.voteIMDB && !processInfo.voteFILMA;

  const titleRating = (
    <div className="w-full flex-row">
      {/* //- NAME AND MEDIA */}
      <div className="relative flex justify-between items-stretch">
        <div className="justify-start font-semibold text-lg md:text-2xl w-[95%]">
          {processInfo.title}
          {mediaDate}
        </div>
        <div className="hidden md:block">{typeCountryStatusBlock}</div>
      </div>
      {/* //! RATING */}
      <div className="relative flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          {processInfo.voteAverage > 0 ? (
            <div className="relative" ref={externalRatingsRef}>
              <button
                type="button"
                className="cursor-pointer flex flex-row gap-1 items-center leading-none"
                onClick={() => setShowExternalRatings((v) => !v)}
                aria-label={t('Show external ratings')}
              >
                <BaseIcon
                  icon="starRating"
                  className={`size-6 md:size-5 ${
                    isTmdbOnly ? 'text-[#01b4e4]' : 'text-amber-400'
                  }`}
                />
                <span
                  className={isTmdbOnly ? 'text-[#01b4e4]' : 'text-amber-400'}
                >
                  {processInfo.voteAverage}
                </span>
                <BaseIcon
                  icon={showExternalRatings ? 'caretUpSmall' : 'caretDownSmall'}
                  className={`size-6 md:size-5 ${
                    isTmdbOnly ? 'text-[#01b4e4]' : 'text-amber-400'
                  }`}
                />
              </button>
              {showExternalRatings && (
                <div className="absolute flex flex-col gap-2 left-0 top-full mt-1 z-20 bg-[#20283E]/90 backdrop-blur-2xl rounded-md p-2 min-w-max shadow-lg">
                  <ExternalRating
                    icon={FILMA}
                    alt={t('Filmaffinity Icon')}
                    value={processInfo.voteFILMA}
                    iconClassName="inline-block w-6 rounded-md"
                  />
                  <ExternalRating
                    icon={IMDB}
                    alt={t('IMDB Icon')}
                    value={processInfo.voteIMDB}
                  />
                  <ExternalRating
                    icon={TMDB}
                    alt={t('TMDB Icon')}
                    value={processInfo.voteTMDB}
                  />
                </div>
              )}
            </div>
          ) : null}
          {userExist ? (
            <Rating
              dataMediaUser={dataMediaUser}
              mediaId={id}
              media_type={mediaType}
              runtime={processInfo.runTime}
              setPendingSeen={setPendingSeen}
              pendingSeen={pendingSeen}
            />
          ) : null}
        </div>
        <div className="md:hidden">{typeCountryStatusBlock}</div>

        <div className="hidden lg:block absolute right-0 top-0">
          {/* // ! STREAMING */}
          {streamingOrWatchProviders}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <PageTitle title={`${processInfo.title} (${processInfo.date})`} />
      <div className="static content-center shadow-md">
        <div className="static h-full w-full flex flex-col md:flex-row justify-center md:gap-4 pt-4 px-2 md:px-4 items-center md:items-start">
          {/* - POSTER & BUTTONS */}
          <div className="flex flex-col gap-2 rounded-xl justify-between items-center w-auto">
            <div className="flex flex-col">
              <div className="relative flex flex-row w-auto md:w-60 lg:w-72">
                {poster}
              </div>
              {/* BUTTONS ICONS POSTER */}
              {userExist ? (
                <div className="flex flex-row items-center gap-4 text-center mt-2 justify-around md:justify-between">
                  {/* //-SEEN/UNSEEN */}
                  <div className="text-right align-middle">
                    {mediaType !== 'person' && (
                      <SeenPendingButton
                        condition={seen}
                        text={'Seen'}
                        handle={handleSeenMedia}
                      />
                    )}
                  </div>
                  {/* //-ADD PLAYLIST */}
                  <ShowPlaylistMenu
                    userId={user.id}
                    id={Number(id)}
                    type={mediaType}
                    runTime={processInfo.runTime}
                  />
                  <div className={`flex items-center gap-4`}>
                    {/* //-REPEAT/NO REPEAT */}
                    {mediaType !== 'person' && seen && (
                      <RepeatSeenButton
                        condition={repeat}
                        handle={handleRepeatSeen}
                      />
                    )}
                    {/* //-PENDING/NO PENDING */}
                    {mediaType !== 'person' && (
                      <SeenPendingButton
                        condition={pending}
                        text={'Pending'}
                        handle={handlePending}
                        className="pb-0.5"
                      />
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <div className="mt-4 md:mt-6">
            {titleRating}
            {/* //-ORIGINAL NAME, YEAR & KEYWORDS */}
            <div className="flex flex-row justify-between items-stretch">
              <div className="text-xs md:text-base mt-4">
                <div className="text-gray-400">
                  {processInfo.titleVOSE === null
                    ? null
                    : `${t('Original title')}:`}
                  <div className="text-gray-200 inline-block pl-1">
                    {processInfo.titleVOSE === null
                      ? null
                      : processInfo.titleVOSE}
                  </div>
                </div>

                {/* // - GENRES & KEYWORDS */}
                <div className="text-left text-sm mt-4">
                  {/* // . GENRES */}
                  {processInfo.genre &&
                    processInfo.genre.map((gen, index) => {
                      const idGen = gen.id;
                      return (
                        <div
                          className="inline-block pr-1"
                          key={Math.floor(
                            (1 + index + Math.random()) * 0x10000,
                          )}
                        >
                          <Link
                            to={`/${mediaType}/${id}/genre/${idGen}`}
                            className="inline-block capitalize cursor-pointer text-purpleNR md:hover:text-gray-400"
                          >
                            {gen.name}
                          </Link>
                          {processInfo.genre &&
                          index !== processInfo.genre.length - 1
                            ? ' - '
                            : ''}
                        </div>
                      );
                    })}
                  {/* // . KEYWORDS */}
                  {wordsKey && Object.keys(wordsKey).length > 0
                    ? keywordsGenre
                    : null}
                </div>
              </div>
            </div>
            {/* // - RUNTIME & TRAILER */}
            <div className="flex flex-row gap-2 items-center justify-between md:justify-start mt-4">
              {/* // . TIME MIN */}
              <div className="flex flex-row gap-2 items-center">
                {processInfo.TimeHM && processInfo.TimeHM !== 0
                  ? processInfo.TimeHM
                  : null}
                {mediaType === 'tv' ? (
                  <div className="flex flex-col md:flex-row gap-2 items-center">
                    {/* // .  TIME EPISODE + Nº Seasons y Episodes & TRAILER */}
                    {/* // SEASONS+EPISODES */}
                    <div className="text-xs">
                      {/* // SEASONS+EPISODES */}
                      {processInfo.numEpis &&
                        `(${processInfo.numSeason} ${t('S')}. ${
                          processInfo.numEpis
                        } ${t('Ep')})`}
                    </div>
                    {processInfo.TotalTimeMarathon ? (
                      <div className="flex gap-1 text-xs text-gray-400">
                        <p>{t('Binge-watch a series')}: </p>
                        {processInfo.TotalTimeMarathon}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div
                    className={
                      processInfo.runTime !== 0
                        ? 'inline-block text-xs pr-1'
                        : ''
                    }
                  >
                    {/* //. TIME */}
                    {processInfo.runTime && processInfo.runTime !== 0
                      ? ` (${processInfo.runTime} min)`
                      : null}
                  </div>
                )}
              </div>

              {/* //.TRAILER */}
              {processInfo.trailer ? (
                <BaseButton
                  variant="primary"
                  size="small"
                  onClick={handleVerTrailer}
                  className="inline-flex items-center gap-1 ml-4 px-0 py-0 font-normal"
                >
                  <BaseIcon icon="trailer" size="sm" />
                  {t('Trailer')}
                </BaseButton>
              ) : null}
            </div>
            {/* // . MARATHON + SEEN TIME (user) */}
            {userExist && processInfo.TotalTimeSeen ? (
              <div className="text-xs ml-4 mt-1 flex flex-row gap-1 items-center text-purpleNR">
                <p>{t('Time seen')}: </p>
                {processInfo.TotalTimeSeen}
              </div>
            ) : null}
            {/* // ! INFORMATION */}
            <div className="mt-2 text-sm md:text-base flex flex-col">
              {/* // - DESCRIPTION */}
              {processInfo.description && (
                <div className="pb-4">
                  <div
                    className={`${
                      descriptionExpanded ? '' : 'line-clamp-2'
                    } md:line-clamp-none font-extralight text-sm`}
                  >
                    {processInfo.description}
                  </div>
                  <button
                    type="button"
                    className="md:hidden mt-1 text-sm text-purpleNR cursor-pointer hover:text-gray-400 transition duration-300"
                    onClick={() => setDescriptionExpanded((v) => !v)}
                  >
                    {descriptionExpanded ? t('Read less') : t('Read more')}
                  </button>
                </div>
              )}
              <div className="flex flex-row justify-between items-center pb-2 md:pb-0">
                {/* //- PREMIERE & COUNTRY */}
                <div className="flex flex-row gap-1 items-center text-sm">
                  <div className="text-gray-400 text-xs">
                    {processInfo.yearRelease ? `${t('PREMIERE')}:` : null}
                  </div>
                  <div className="text-grayNR text-xs">
                    {processInfo.yearRelease}
                  </div>
                </div>
                {/* // ! STREAMING */}
                <div className="md:hidden">{streamingOrWatchProviders}</div>
              </div>
              {/* // - LAST EPISODE & NEXT EPISODE */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                {processInfo.LastAirDate ? (
                  <div className="flex flex-row gap-2 text-xs items-center">
                    <div className="text-gray-400">{t('LAST EPISODE')}:</div>
                    <span>{processInfo.LastAirDate}</span>
                  </div>
                ) : null}
                {/* // NEXT EPISODE */}
                {processInfo.NextEpAir ? (
                  <div className="flex flex-row gap-2 text-xs items-center">
                    <div className="text-gray-400">{t('NEXT EPISODE')}:</div>
                    <span>{processInfo.NextEpAir}</span>
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                className="md:hidden my-2 text-sm text-purpleNR cursor-pointer md:hover:text-gray-400 transition duration-300"
                onClick={() => setCrewExpanded((v) => !v)}
              >
                {crewExpanded ? t('Hide credits') : t('Show credits')}
              </button>
              <div className={`${crewExpanded ? 'block' : 'hidden'} md:block`}>
                {/* //-CREATE BY */}
                <CreditList
                  label={t('CREATE BY')}
                  items={createdByList}
                  totalCount={created_by?.length || 0}
                  mediaType={mediaType}
                  mediaId={id}
                />
                {/* //-DIRECTED BY & PRODUCER */}
                {uniqueDirecting && uniqueDirecting.length > 0 ? (
                  <>
                    <CreditList
                      label={t('DIRECTED BY')}
                      items={uniqueDirecting}
                      totalCount={directingAll.length}
                      mediaType={mediaType}
                      mediaId={id}
                    />
                    <CreditList
                      label={t('PRODUCER')}
                      items={processInfo.productCompany}
                      linkable={false}
                    />
                  </>
                ) : null}
                {/* //-WRITTEN BY */}
                <CreditList
                  label={t('WRITTEN BY')}
                  items={uniqueWriters}
                  totalCount={writersAll.length}
                  mediaType={mediaType}
                  mediaId={id}
                />
                {/* //-PRODUCTION  */}
                <CreditList
                  label={t('PRODUCTION')}
                  items={uniqueProductions}
                  totalCount={productionsAll.length}
                  mediaType={mediaType}
                  mediaId={id}
                  containerClassName="flex flex-row text-sm mb-4"
                />
              </div>
            </div>
          </div>
        </div>
        {/* // - Complete equipment */}
        <div className="text-purpleNR pr-4 text-right grid justify-center md:justify-end transition ease-in-out md:hover:text-gray-400 duration-300">
          <Link to={`/${mediaType}/${id}/credits`}>
            {t('Delivery and complete equipment')}
            <BiSolidRightArrow
              className="ml-1 cursor-pointer inline-block"
              alt={t('Right arrow icon')}
            />
          </Link>
        </div>
        {/* //- MAIN CAST */}
        {items.length > 0 ? (
          <div className="text-gray-200 rounded-xl ">
            <div className="px-4">
              <CarouselCredits
                title={t('MAIN CAST')}
                info={items}
                media={mediaType}
                id={id}
                isUser={userExist}
                nameFilm={processInfo.title}
                changeSeenPending={changeSeenPending}
                setChangeSeenPending={setChangeSeenPending}
                size={'small'}
              />
            </div>
          </div>
        ) : null}
        {/* //-COLLECTIONS / SEASONS */}
        <div className="text-lg">
          {processInfo.collection ? (
            <Collections
              idCollection={processInfo.collection.id}
              media={mediaType}
              pendingSeenMedia={pendingSeen}
              setPendingSeenMedia={setPendingSeen}
            />
          ) : (
            seasons && (
              <Seasons
                info={seasons && seasons}
                idTvShow={id}
                mediaIsSeen={seen}
                runTime={processInfo.runTime}
                setChangeSeenPending={setChangeSeenPending}
                changeSeenPending={changeSeenPending}
                numberEpisodes={number_of_episodes}
                numberSeasons={number_of_seasons}
                runTimeSeasons={processInfo.runTimeSeasons}
              />
            )
          )}
        </div>
        <div className="pb-6">
          {/* //-RECOMMENDATIONS */}
          {info.id === id ? (
            <Recommendations
              title={
                mediaType === 'movie' ? t('Recommendations') : t('Similar')
              }
              id={id}
              media={mediaType}
              lang={langApi}
              pendingSeenMedia={pendingSeen}
              setPendingSeenMedia={setPendingSeen}
            />
          ) : null}
          {/* //-SIMILAR */}
          {info.id === id ? (
            <Similar
              title={
                mediaType === 'movie' ? t('Similar') : t('Recommendations')
              }
              id={id}
              media={mediaType}
              lang={langApi}
              pendingSeenMedia={pendingSeen}
              setPendingSeenMedia={setPendingSeen}
            />
          ) : null}
        </div>
        <BaseModal
          visible={modal}
          onClose={() => setModal(false)}
          className="bg-black"
        >
          <iframe
            title={`${processInfo.title} trailer`}
            className="w-full aspect-video"
            src={`https://www.youtube.com/embed/${processInfo.trailer}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </BaseModal>
      </div>
    </>
  );
}

export default DetailsMedia;

DetailsMedia.defaultProps = {
  info: {},
  crews: [],
  cast: [],
  mediaType: '',
  dataMediaUser: {},
  setChangeSeenPending: () => {},
  changeSeenPending: true,
};
DetailsMedia.propTypes = {
  info: PropTypes.object,
  crews: PropTypes.array,
  cast: PropTypes.array,
  mediaType: PropTypes.string,
  dataMediaUser: PropTypes.object,
  setChangeSeenPending: PropTypes.func,
  changeSeenPending: PropTypes.bool,
};
