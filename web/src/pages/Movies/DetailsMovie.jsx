import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import {
  BsFillCaretDownFill,
  BsFillCaretUpFill,
  BsAlarm,
  BsAlarmFill,
} from "react-icons/bs";
import Trailers from "../../components/MediaList/Trailers";
import KeyWords from "../../components/MediaList/KeyWords";
import Collections from "../../components/Movie/Collections";
import Rating from "../../components/MediaList/Rating/Rating";
import CarouselCredits from "../../utils/Carousel/CarouselCredits";
import Similar from "../../components/MediaList/Similar";
import Recommendations from "../../components/MediaList/Recommendations";
import CountryName from "../../components/CountryName";
import Certification from "../../components/MediaList/Certification/Certification";
import DateAndTimeConvert from "../../utils/DateAndTimeConvert";
import calculateAverageVote from "../../components/MediaList/calculateAverageVote";
// img
import { NoImage, TMDB, IMDB, FILMA, star, movie, tv } from "../../assets/image";
// api
import {
  getKeyWords,
  getMediaDetailsEN,
  getTrailer,
  getWatchList,
} from "../../../services/TMDB/services-tmdb";
import { getRating } from "../../../services/IMDB/services-imdb";
import { useAuthContext } from "../../context/auth-context";
import {
  deleteMedia,
  getDetailMedia,
  getUser,
  patchMedia,
  postMedia,
  postPlaylistMedia,
} from "../../../services/DB/services-db";
import {
  IoCheckmarkCircleOutline,
  IoCheckmarkCircleSharp,
} from "react-icons/io5";
import { IoIosRemove, IoMdAdd } from "react-icons/io";
import { RiMovie2Line } from "react-icons/ri";
import { BiSolidRightArrow } from "react-icons/bi";
import Seasons from "../../components/TV/Seasons";

function DetailsMovie({ info, crews, cast, media }) {
  const [t, i18next] = useTranslation("translation");
  const { user } = useAuthContext();
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
  const navigate = useNavigate();
  const [dataUser, setDataUser] = useState({});
  useEffect(() => {
    const Data = async () => {
      getUser()
        .then((data) => {
          setDataUser(data);
        })
        .catch((err) => err);
    };
    if (userExist && id) {
      Data();
    }
  }, [userExist, id]);

  // SCROLL UP
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Language Selected
  const [langApi, setLangApi] = useState("es-ES");
  const [langTrailer, setLangTrailer] = useState("es-ES"); // if much probably have trailer in english compared of another language
  useEffect(() => {
    setLangApi(i18next.language);
    setLangTrailer(i18next.language);
  }, [i18next]);

  // - SERVICES
  const [detailsWatchList, setDetailsWatchList] = useState({});
  const [trailerListData, setTrailerListData] = useState([]);
  const [tmbdEnApi, setTmbdEnApi] = useState({});
  const [wordsKeyData, setWordsKeyData] = useState({});
  useEffect(() => {
    if ((langApi, media, id)) {
      getWatchList(media, id, langApi).then((data) => {
        setDetailsWatchList(data.results);
      });
      getMediaDetailsEN(media, id, langApi).then((data) => {
        setTmbdEnApi(data);
      });
      getKeyWords(media, id, langApi).then((data) => {
        setWordsKeyData(data);
      });
    }
  }, [langApi, id, media]);
  useEffect(() => {
    if ((langTrailer, media, id)) {
      getTrailer(media, id, langTrailer).then((data) => {
        setTrailerListData(data.results);
      });
    }
  }, [langTrailer, id, media]);
  // - KEYWORDS
  const [modalKeywords, setModalKeywords] = useState(false);
  const [wordsKey, setWordsKey] = useState(null);
  useEffect(() => {
    if (Object.keys(wordsKeyData).length > 0) {
      const wordsKey =
        media === "movie" ? wordsKeyData.keywords : wordsKeyData.results;
      setWordsKey(wordsKey);
    }
  }, [media, wordsKeyData]);

  // -API IMDB y Filmafinity
  const [imdbList, setImdbList] = useState({});
  useEffect(() => {
    if ((langApi, imdb_id)) {
      getRating(imdb_id, langApi).then((data) => {
        setImdbList(data);
      });
    }
  }, [langApi, imdb_id]);

  // -VER TRAILER
  const [modal, setModal] = useState(false);
  const handleVerTrailer = () => {
    setModal(true);
  };
  const [pendingSeen, setPendingSeen] = useState(false);

  // ! USER COMPARATOR
  const [dataMediaUser, setDataMediaUser] = useState({});
  useEffect(() => {
    if (userExist) {
      getDetailMedia(id).then((d) => {
        setDataMediaUser(d);
      });
    }
  }, [pendingSeen, id, userExist]);
  const { like, seen, pending, vote } = dataMediaUser;
  useEffect(() => {
    if (userExist && !like && !seen && !pending && vote === -1) {
      deleteMedia(id).then(() => {
        setPendingSeen(!pendingSeen);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataMediaUser]);
  const [playlistsList, setPlaylistsList] = useState(false);
  const [errorAddPlaylists, setErrorAddPlaylists] = useState(false);
  const handleAddPlaylist = async (playlistId) => {
    if (userExist) {
      try {
        await postPlaylistMedia(playlistId, {
          mediaId: `${id}`,
          media_type: media,
          runtime: processInfo.runTime,
        });
      } catch (error) {
        if (error) {
          const { message } = error.response?.data || {};
          setErrorAddPlaylists(message);
        }
      }
    }
  };

  const [isTimeout, setIsTimeout] = useState(true);
  useEffect(() => {
    let timerId;

    if (isTimeout && errorAddPlaylists) {
      timerId = window.setTimeout(() => {
        setIsTimeout(false);
        setErrorAddPlaylists(false);
      }, 3000);
    }
    return () => {
      if (timerId) {
        clearTimeout(timerId); // Clean the timer
      }
    };
  }, [isTimeout, errorAddPlaylists]);

  // -MAIN CAST
  const size = 20;
  const items = cast && cast.slice(0, size);
  // Check if type trailer and change language
  const trailer =
    trailerListData &&
    trailerListData.length > 0 &&
    trailerListData.filter((crew) => crew.type === "Trailer");
  if (
    trailerListData !== "" &&
    trailerListData &&
    trailerListData.length > 0 &&
    trailerListData.length === 0 &&
    langApi === "es-ES"
  ) {
    setLangTrailer("en-US");
    const trailer =
      trailerListData &&
      trailerListData.length > 0 &&
      trailerListData.filter((crew) => crew.type === "Trailer");
    return trailer;
  }
  // -POSTER URL
  const url =
    (poster_path && poster_path !== undefined) || (poster_path && poster_path)
      ? `https://www.themoviedb.org/t/p/w300_and_h450_bestv2${poster_path}`
      : null;
  const processInfo = {};
  processInfo.poster = url || NoImage;
  processInfo.mediaType = media === "movie" ? "Movie" : "TV Show";
  processInfo.title = title || name;
  processInfo.titleVOSE = original_title || original_name;
  processInfo.genre = genres || [];
  processInfo.productCompany = production_companies || [];
  processInfo.runTime =
    media === "movie"
      ? runtime
      : episode_run_time && episode_run_time.length > 0
      ? episode_run_time
      : 0;
  processInfo.TimeHM =
    runtime > 0 && !episode_run_time
      ? new DateAndTimeConvert(processInfo.runTime, t, false).TimeConvert()
      : episode_run_time && episode_run_time[0]
      ? `${episode_run_time[0]} min.`
      : null;
  processInfo.numSeason = number_of_seasons;
  processInfo.numEpis = number_of_episodes;
  processInfo.voteTMDB =
    vote_average > 0 ? Math.round(vote_average * 10) / 10 : 0;
  processInfo.voteIMDB = imdbList.imDb > 0 ? Number(imdbList.imDb) : null;
  processInfo.voteFILMA =
    imdbList.filmAffinity > 0 ? Number(imdbList.filmAffinity) : null;
  processInfo.voteAverage = calculateAverageVote(
    processInfo.voteTMDB,
    processInfo.voteIMDB,
    processInfo.voteFILMA
  );
  processInfo.countries = production_countries || origin_country;
  processInfo.description = overview || tmbdEnApi.overview || "";
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
        false
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
          false
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
      true
    ).DateTimeConvert();
  processInfo.TotalTime =
    number_of_episodes * episode_run_time > 0
      ? new DateAndTimeConvert(
          number_of_episodes * episode_run_time,
          t,
          false
        ).TimeConvert()
      : 0;

  processInfo.watchingBuy =
    detailsWatchList && detailsWatchList.ES && detailsWatchList.ES.buy
      ? detailsWatchList.ES.buy
      : null;
  processInfo.watching =
    detailsWatchList && detailsWatchList.ES && detailsWatchList.ES.flatrate
      ? detailsWatchList.ES.flatrate
      : null;
  processInfo.watchingFree =
    detailsWatchList && detailsWatchList.ES && detailsWatchList.ES.free
      ? detailsWatchList.ES.free
      : null;
  processInfo.watchingAds =
    detailsWatchList && detailsWatchList.ES && detailsWatchList.ES.ads
      ? detailsWatchList.ES.ads
      : null;

  processInfo.NoWatch =
    processInfo.watching === null &&
    processInfo.watchingFree === null &&
    processInfo.watchingAds === null &&
    processInfo.watchingBuy === null
      ? null
      : t("Available");

  processInfo.trailer = trailer && trailer[0] ? trailer[0].key : null;
  processInfo.collection = belongs_to_collection;
  processInfo.status = media === "tv" ? status : null;

  const directing = crews.filter((crew) => crew.department === "Directing");

  const writers = crews.filter((crew) => crew.department === "Writing");
  const productions = crews.filter((crew) => crew.department === "Production");

  const uniqueWriters = Array.from(new Set(writers.map((a) => a.id)))
    .map((id) => writers.find((a) => a.id === id))
    .slice(0, 6);
  const uniqueDirecting = Array.from(new Set(directing.map((a) => a.id)))
    .map((id) => directing.find((a) => a.id === id))
    .slice(0, 3);
  const uniqueProductions = Array.from(new Set(productions.map((a) => a.id)))
    .map((id) => productions.find((a) => a.id === id))
    .slice(0, 5);
    document.title = `${processInfo.title} (${processInfo.date})`;

  const keywordsGenre = modalKeywords ? (
    <div>
      <button
        className="pt-2 cursor-pointer text-left text-sm  px:center text-purpleNR transition ease-in-out md:hover:text-gray-200 duration-300"
        onClick={() => setModalKeywords(!modalKeywords)}
      >
        {t("Key Words")}
        <BsFillCaretUpFill
          className="inline-block align-middle ml-1"
          size={16}
          alt={t("Close Keywords")}
        />
      </button>
      {modalKeywords && <KeyWords wordsKey={wordsKey} media={media} id={id} />}
    </div>
  ) : (
    <div>
      <button
        className="pt-2 cursor-pointer text-left text-sm  px:center text-purpleNR transition ease-in-out md:hover:text-gray-200 duration-300"
        onClick={() => setModalKeywords(!modalKeywords)}
      >
        {t("Key Words")}
        <BsFillCaretDownFill
          className="inline-block align-middle ml-1"
          size={16}
          alt={t("Open Keywords")}
        />
      </button>
    </div>
  );
  //- SEEN/UNSEEN
  const handleSeenMedia = () => {
    if (userExist && Object.keys(dataMediaUser).length) {
      patchMedia(id, { seen: !seen }).then(() => setPendingSeen(!pendingSeen));
    } else {
      postMedia({
        mediaId: id,
        media_type: media,
        runtime: processInfo.runTime,
        like: false,
        seen: true,
      }).then((data) => {
        if (data) {
          setPendingSeen(!pendingSeen);
        }
      });
    }
  };
  // - PENDING/NO PENDING
  const handlePending = () => {
    if (userExist && Object.keys(dataMediaUser).length) {
      patchMedia(id, { pending: !pending }).then(() =>
        setPendingSeen(!pendingSeen)
      );
    } else {
      postMedia({
        mediaId: id,
        media_type: media,
        runtime: processInfo.runTime,
        pending: true,
      }).then((data) => {
        if (data) {
          setPendingSeen(!pendingSeen);
        }
      });
    }
  };

  const poster = poster_path ? (
    <img
      className="rounded-xl w-48 sm:w-auto justify-self-center"
      src={processInfo.poster}
      alt={name}
    />
  ) : (
    <div className="relative flex justify-center items-center">
      <img
        className="absolute h-24 opacity-10"
        src={media === "movie"
        ? movie
        : media === "tv"
        ? tv
        : null}
        alt={t("Icon people")}
      />
      <img
        className="rounded-xl w-48 sm:w-auto justify-self-center"
        src={processInfo.poster}
        alt={name}
      />
    </div>
  )

  return (
    <>
      <div className="static content-center shadow-md">
        {modal && (
          <Trailers setModal={setModal} trailerVideo={processInfo.trailer} />
        )}
        <div className=" static h-full w-full grid md:grid-flow-col gap-4 p-2 md:pt-4 md:px-4 items-start">
          {modal === true ? (
            // ! TRAILER OPEN
            // -VOTE AVERAGE, POSTER
            <div className="static row-span-2 rounded-xl">
              {processInfo.voteAverage && processInfo.voteAverage > 0 && (
                <div className="hidden bottom-auto right-auto left-0 px-2 ml-2 inset-y-2 inset-x-8 backdrop-blur-md bg-black/50 rounded-lg">
                  <img
                    className="inline-block pr-1 py-2 w-4"
                    src={star}
                    alt={t("Star Icon Rating")}
                  />
                  <div className="inline-block inset-y-2  inset-x-5 text-amber-400 text-xs text-left leading-4">
                    {processInfo.voteAverage}
                  </div>
                </div>
              )}
              <img
                className="rounded-xl"
                src={processInfo.poster}
                alt={processInfo.title}
              />
            </div>
          ) : (
            // ! TRAILER NO OPEN
            // -VOTE AVERAGE, POSTER, BUTTONS, PLAYLISTS Y WHERE SEE
            <div className="relative row-span-2 rounded-xl col-span-2 sm:col-span-1 grid justify-items-stretch">
              {processInfo.voteAverage && processInfo.voteAverage > 0 && (
                <div className="absolute bottom-auto right-auto left-0 px-2 ml-[84px] sm:ml-2 inset-y-2 inset-x-8 backdrop-blur-md bg-black/50 rounded-lg">
                  <img
                    className="inline-block pr-1 py-2 w-4"
                    src={star}
                    alt={t("Star Icon Rating")}
                  />
                  <div className="inline-block inset-y-2 inset-x-5 text-amber-400 text-xs text-left leading-4">
                    {processInfo.voteAverage}
                  </div>
                </div>
              )}
              {poster}
              {userExist ? (
                <div className="grid grid-cols-4 gap-4 text-center mt-5 justify-center justify-items-center">
                  {/* //-SEEN/UNSEEN */}
                  {userExist ? (
                    <div className="text-right align-middle">
                      {media !== "person" ? (
                        seen !== true ? (
                          <button className="cursor-pointer transition ease-in-out md:hover:scale-110 duration-300">
                            <IoCheckmarkCircleOutline
                              className="inline-block"
                              size={25}
                              color="#FFCA28"
                              alt={t("Seen")}
                              onClick={handleSeenMedia}
                            />
                          </button>
                        ) : (
                          <button className="cursor-pointer transition ease-in-out md:hover:scale-110 duration-300">
                            <IoCheckmarkCircleSharp
                              className="inline-block"
                              size={25}
                              color="#FFCA28"
                              alt={t("Unseen")}
                              onClick={handleSeenMedia}
                            />
                          </button>
                        )
                      ) : null}
                    </div>
                  ) : null}
                  {/* //-ADD PLAYLIST */}
                  {userExist ? (
                    <div className="col-span-2  cursor-pointer text-left text-base font-semibold px:center text-[#7B6EF6] transition duration-300 ">
                      <button
                        className={`cursor-pointer text-left font-semibold px:center ${
                          !playlistsList ? "text-[#7B6EF6]" : "text-gray-600"
                        } transition ease-in-out md:hover:scale-105 duration-300`}
                        onClick={() => setPlaylistsList(!playlistsList)}
                      >
                        {!playlistsList ? (
                          <IoMdAdd
                            className="inline-block"
                            size={20}
                            alt={t("Add to one list")}
                          />
                        ) : (
                          <IoIosRemove
                            className="inline-block"
                            size={20}
                            alt={t("Add to one list")}
                          />
                        )}
                        {t("Playlists")}
                      </button>
                      {playlistsList ? (
                        <div className="absolute flex flex-col text-base bg-grayNR/60 rounded-md md:w-[200px] w-[150px]">
                          {errorAddPlaylists ? (
                            <div className="text-white bg-gray-50/20 px-1 font-bold">
                              {t(errorAddPlaylists)}
                            </div>
                          ) : null}
                          {user &&
                            dataUser &&
                            dataUser.playlists.map((i, index) => {
                              const roundedTopItem =
                                index === 0 ? "rounded-t-md" : null;
                              const roundedBottomItem =
                                dataUser.playlists.length === index + 1
                                  ? "rounded-b-md"
                                  : null;

                              return (
                                <div
                                  key={i.id}
                                  className={`hover:bg-gray-50 px-1 ${
                                    dataUser.playlists.length === 1
                                      ? "rounded-md"
                                      : null
                                  } ${roundedTopItem} ${roundedBottomItem} cursor-pointer transition duration-200`}
                                  onClick={() => handleAddPlaylist(i.id)}
                                >
                                  <div className="text-black text-left">
                                    · {i.title}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  {/* //-PENDING/NO PENDING */}
                  {userExist ? (
                    <div className="text-right align-middle">
                      {media !== "person" ? (
                        pending !== true ? (
                          <button className="cursor-pointer transition ease-in-out md:hover:scale-110 duration-300">
                            <BsAlarm
                              className="inline-block"
                              size={22}
                              color="#FFCA28"
                              alt={t("Pending")}
                              onClick={handlePending}
                            />
                          </button>
                        ) : (
                          <button className="cursor-pointer transition ease-in-out md:hover:scale-110 duration-300">
                            <BsAlarmFill
                              className="inline-block"
                              size={22}
                              color="#FFCA28"
                              alt={t("No Pending")}
                              onClick={handlePending}
                            />
                          </button>
                        )
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
              {/* //-WHERE SEE OR BUY */}
              <div className="text-left mt-5">
                <h1 className="text-gray-400">{t("WHERE TO SEE IT")}</h1>
                {processInfo.NoWatch === null ? t("Not Available") : null}
                {/* // STREAM */}
                {processInfo.watching ? t("Stream") : null}
                <div className={processInfo.watching ? "" : ""}>
                  {processInfo.watching && processInfo.watching
                    ? processInfo.watching.map((watchin, index) => (
                        <img
                          className="inline-block h-14 w-auto rounded-2xl px-1 pb-1"
                          src={`https://image.tmdb.org/t/p/original/${watchin.logo_path}`}
                          alt={watchin.provider_name}
                          key={Math.floor(
                            (1 + index + Math.random()) * 0x10000
                          )}
                        />
                      ))
                    : null}
                  {processInfo.watchingAds
                    ? processInfo.watchingAds.map((watchin, index) => (
                        <img
                          className="inline-block h-14 w-auto rounded-2xl px-1 pb-1"
                          src={`https://image.tmdb.org/t/p/original/${watchin.logo_path}`}
                          alt={watchin.provider_name}
                          key={Math.floor(
                            (1 + index + Math.random()) * 0x10000
                          )}
                        />
                      ))
                    : null}
                </div>
              </div>
              {/* // BUY */}
              <div className={processInfo.watchingBuy ? "text-left" : ""}>
                {processInfo.watchingBuy ? t("Buy") : null}
                <div className={processInfo.watchingBuy ? "pt-2" : ""}>
                  {processInfo.watchingBuy && processInfo.watchingBuy
                    ? processInfo.watchingBuy.map((watchingBuy, index) => (
                        <img
                          className="inline-block h-14 w-auto rounded-2xl px-1 pb-1"
                          src={`https://image.tmdb.org/t/p/original/${watchingBuy.logo_path}`}
                          alt={watchingBuy.provider_name}
                          key={Math.floor(
                            (1 + index + Math.random()) * 0x10000
                          )}
                        />
                      ))
                    : null}
                </div>
              </div>
              {/* // FREE */}
              <div className={processInfo.watchingFree ? "text-left" : ""}>
                {processInfo.watchingFree ? t("Free") : null}
                <div className={processInfo.watchingFree ? "pt-2" : ""}>
                  {processInfo.watchingFree && processInfo.watchingFree
                    ? processInfo.watchingFree.map((watchingFree, index) => (
                        <img
                          className="inline-block h-14 w-auto rounded-2xl px-1 pb-1"
                          src={`https://image.tmdb.org/t/p/original/${watchingFree.logo_path}`}
                          alt={watchingFree.provider_name}
                          key={Math.floor(
                            (1 + index + Math.random()) * 0x10000
                          )}
                        />
                      ))
                    : null}
                </div>
              </div>
            </div>
          )}
          <div className="col-span-2">
            <div className=" mt-6 px-2">
              {/* //-NAME AND MEDIA */}
              <div className="flex justify-between items-stretch">
                <div className="inline-block ">
                  <div className="font-semibold text-xl md:text-4xl pr-10 inline-block">
                    {processInfo.title}
                    {processInfo.date ? (
                      <p className="ml-1 inline-block text-sm md:text-base">
                        {`(${processInfo.date})`}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div>
                  <div className="text-xs capitalize text-right">
                    {t(processInfo.mediaType)}
                  </div>
                  <div>
                    <Certification
                      info={processInfo.countries}
                      media={media}
                      id={id}
                      lang={langApi}
                    />
                  </div>
                  {processInfo.status ? (
                    <div>
                      {processInfo.status === "Returning Series" ? (
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
              </div>
              {/* //-RATING */}
              {userExist ? (
                <Rating
                  dataMediaUser={dataMediaUser}
                  mediaId={id}
                  media_type={media}
                  runtime={
                    media === "tv"
                      ? processInfo.runTime[0]
                      : processInfo.runTime
                  }
                  setPendingSeen={setPendingSeen}
                  pendingSeen={pendingSeen}
                />
              ) : null}
              {/* //-ORIGINAL NAME AND YEAR */}
              <div className="flex justify-between items-stretch flex-row">
                <div className="text-xs md:text-base mt-4 basis-9/12 md:basis-10/12">
                  <div className="text-gray-400">
                    {processInfo.titleVOSE === null
                      ? null
                      : `${t("Original title")}:`}
                    <div className="text-gray-200 inline-block pl-1">
                      {processInfo.titleVOSE === null
                        ? null
                        : processInfo.titleVOSE}
                    </div>
                  </div>

                  {/* //-GENRES */}
                  <div className="text-left text-sm mt-4">
                    {processInfo.genre &&
                      processInfo.genre.map((gen, index) => {
                        const idgen = gen.id;
                        return (
                          <div
                            className="inline-block pr-1"
                            key={Math.floor(
                              (1 + index + Math.random()) * 0x10000
                            )}
                          >
                            <Link
                              to={`/${media}/${id}/genre/${idgen}`}
                              className="inline-block capitalize cursor-pointer text-gray-200 hover:text-gray-400"
                            >
                              {gen.name}
                            </Link>
                            {processInfo.genre &&
                            index !== processInfo.genre.length - 1
                              ? " - "
                              : ""}
                          </div>
                        );
                      })}
                    {/* //-KEYWORDS */}
                    {wordsKey && Object.keys(wordsKey).length > 0
                      ? keywordsGenre
                      : null}
                  </div>
                </div>
                {/* //-RATING OTHER PLATFORMS */}
                <div className="text-right basis-3/12 md:basis-2/12">
                  {/* //.FILMAFFINITY */}
                  {processInfo.voteFILMA && processInfo.voteFILMA > 0 && (
                    <div className="mb-1">
                      <img
                        className="inline-block w-6 rounded-md"
                        src={FILMA}
                        alt={t("Filmaffinity Icon")}
                      />
                      <div className="inline-block text-amber-400 text-xs text-left pl-2">
                        {processInfo.voteFILMA}
                      </div>
                    </div>
                  )}
                  {/* //.IMDB */}
                  {processInfo.voteIMDB && processInfo.voteIMDB > 0 && (
                    <div>
                      <img
                        className="inline-block pr-1 w-10"
                        src={IMDB}
                        alt={t("IMDB Icon")}
                      />
                      <div className="inline-block text-amber-400 text-xs text-left pl-1">
                        {processInfo.voteIMDB}
                      </div>
                    </div>
                  )}
                  {/* //.TMDB */}
                  {processInfo.voteTMDB && processInfo.voteTMDB > 0 ? (
                    <div>
                      <img
                        className="inline-block pr-1 w-10"
                        src={TMDB}
                        alt={t("TMDB Icon")}
                      />
                      <div className="inline-block text-amber-400 text-xs text-left pl-1">
                        {processInfo.voteTMDB}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
              {/* // -RUNTIME & TRAILER */}
              <div className="flex items-center mt-4">
                <div className={processInfo.runTime !== 0 ? "pr-2" : ""}>
                  {/* // . TIME MIN */}
                  {processInfo.TimeHM && processInfo.TimeHM !== 0
                    ? processInfo.TimeHM
                    : null}
                </div>
                {media !== "tv" ? (
                  <div
                    className={
                      processInfo.runTime !== 0
                        ? "inline-block text-xs pr-1"
                        : ""
                    }
                  >
                    {/* //. TIME */}
                    {processInfo.runTime && processInfo.runTime !== 0
                      ? ` (${processInfo.runTime} min)`
                      : null}
                  </div>
                ) : (
                  <>
                    {/* // .  TIME EPISODE + Nº Seasons y Episodes & TRAILER */}
                    {/* // SEASONS+EPISODES */}
                    <div className="text-xs">
                      {/* // SEASONS+EPISODES */}
                      {processInfo.numEpis &&
                        `(${processInfo.numSeason} ${t("S")}. ${
                          processInfo.numEpis
                        } ${t("Ep")})`}
                    </div>
                  </>
                )}
                {/* //.TRAILER */}
                {processInfo.trailer ? (
                  <>
                    {processInfo.trailer && (
                      <button
                        className="flex items-center gap-0.5 cursor-pointer text-left text-sm md:text-base font-medium px:center text-purpleNR transition hover:text-grayNR duration-300 ml-4"
                        onClick={handleVerTrailer}
                      >
                        <RiMovie2Line alt={t("See Trailer")} />
                        {`${t("Trailer")}`}
                      </button>
                    )}
                  </>
                ) : null}
              </div>
              {/* // . MARATHON */}
              {processInfo.TotalTime !== 0 ? (
                <div className="text-xs ml-4 mt-0.5 pb-4 flex gap-1">
                  <p>{t("Binge-watch a series")}: </p>
                  {processInfo.TotalTime}
                </div>
              ) : null}
              {/* // - DESCRIPTION */}
              <div className="row-span-2 mt-2 md:mt-2 text-sm md:text-base">
                <div className="pb-4">{processInfo.description}</div>
                {/* //-PREMIERE & COUNTRY */}
                <div className="flex flex-row text-sm mb-4">
                  <div
                    className={
                      processInfo.yearRelease ? "basis-1/2 grid-rows-2" : ""
                    }
                  >
                    <div>
                      <div className="inline-block text-gray-400 mr-1">
                        {processInfo.yearRelease && processInfo.yearRelease
                          ? `${t("PREMIERE")}:`
                          : null}
                      </div>
                      <div className="inline-block">
                        {processInfo.yearRelease}
                      </div>
                    </div>
                  </div>
                  <div className="basis-1/2">
                    <div className="inline-block text-gray-400 mr-1">
                      {processInfo.countries &&
                      processInfo.countries.length !== 0
                        ? `${t("COUNTRY")}:`
                        : null}
                    </div>
                    <div className="inline-block">
                      {processInfo.countries &&
                        processInfo.countries.map((estu, index) => (
                          <div
                            className="inline-block pr-1"
                            key={Math.floor(
                              (1 + index + Math.random()) * 0x10000
                            )}
                          >
                            <CountryName info={estu.iso_3166_1} />
                            {processInfo.countries &&
                            index !== processInfo.countries.length - 1
                              ? ", "
                              : ""}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
                {/* // - LAST EPISODE & NEXT EPISODE */}
                <div className="flex text-sm mb-2">
                  {processInfo.LastAirDate ? (
                    <div className="flex gap-2 basis-1/2">
                      <div className="text-gray-400 mb-2">
                        {t("LAST EPISODE")}:
                      </div>
                      <span>{processInfo.LastAirDate}</span>
                    </div>
                  ) : null}
                  {/* // NEXT EPISODE */}
                  {processInfo.NextEpAir ? (
                    <div className="flex gap-2 basis-1/2">
                      <div className="text-gray-400">{t("NEXT EPISODE")}:</div>
                      <span>{processInfo.NextEpAir}</span>
                    </div>
                  ) : null}
                </div>
                {/* //-CREATE BY */}
                {created_by && created_by.length > 0 ? (
                  <div className="flex flex-row text-sm my-4">
                    <div className="inline-block text-gray-400 mr-1">
                      {`${t("CREATE BY")}:`}
                    </div>
                    <div className="inline-block text-gray-400">
                      {created_by &&
                        created_by.map((created, index) =>
                          index < 5 ? (
                            <button
                              className={`inline-block ${
                                index !== created_by.length - 1 ? "pr-1" : ""
                              } cursor-pointer text-gray-200 hover:text-gray-400`}
                              onClick={() => navigate(`/person/${created.id}`)}
                              key={Math.floor(
                                (1 + index + Math.random()) * 0x10000 +
                                  created.id
                              )}
                            >
                              {created.name}
                              {created_by && index !== created_by.length - 1
                                ? ", "
                                : ""}
                            </button>
                          ) : null
                        )}
                    </div>
                    <div
                      className="inline-block"
                      key={Math.floor((1 + Math.random()) * 0x10000)}
                    >
                      {created_by && created_by.length > 5 ? (
                        <div className="inline-block">
                          {", "}
                          <button
                            className="transition ease-in-out text-purpleNR md:hover:text-gray-400 duration-300 cursor-pointer"
                            onClick={() => navigate(`/${media}/${id}/credits`)}
                          >
                            {t("more...")}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
                {/* //-DIRECTED BY & PRODUCER */}
                {uniqueDirecting && uniqueDirecting.length > 0 ? (
                  <div className="flex flex-row text-sm basis-1/2">
                    <div className="basis-1/2">
                      <div className="inline-block text-gray-400 mr-1">
                        {`${t("DIRECTED BY")}:`}
                      </div>
                      <div className="inline-block">
                        {[
                          uniqueDirecting &&
                            uniqueDirecting.map((dire, index) => (
                              <button
                                className="inline-block pr-1 cursor-pointer hover:text-gray-400"
                                onClick={() => navigate(`/person/${dire.id}`)}
                                key={Math.floor(
                                  (1 + index + Math.random()) * 0x10000
                                )}
                              >
                                {dire.name}
                                {uniqueDirecting &&
                                index !== uniqueDirecting.length - 1
                                  ? ", "
                                  : ""}
                              </button>
                            )),
                          <div
                            className="inline-block"
                            key={Math.floor((1 + Math.random()) * 0x10000)}
                          >
                            {directing && directing.length > 3 ? (
                              <div className="inline-block">
                                {", "}
                                <button
                                  className="transition ease-in-out text-purpleNR md:hover:text-gray-400 duration-300 cursor-pointer"
                                  onClick={() =>
                                    navigate(`/${media}/${id}/credits`)
                                  }
                                >
                                  {t("more...")}
                                </button>
                              </div>
                            ) : null}
                          </div>,
                        ]}
                      </div>
                    </div>
                    {/* // . PRODUCER */}
                    {processInfo.productCompany &&
                    processInfo.productCompany.length > 0 ? (
                      <div className="basis-1/2">
                        <div className="inline-block text-gray-400 mr-1">
                          {`${t("PRODUCER")}:`}
                        </div>
                        <div className="inline-block">
                          {processInfo.productCompany.map((estu, index) => (
                            <div
                              className="inline-block pr-1"
                              key={Math.floor(
                                (1 + index + Math.random()) * 0x10000
                              )}
                            >
                              {estu.name}
                              {processInfo.productCompany &&
                              index !== processInfo.productCompany.length - 1
                                ? ", "
                                : ""}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {/* //-WRITTEN BY */}
                {uniqueWriters && uniqueWriters.length > 0 ? (
                  <div className="flex flex-row text-sm my-4">
                    <div className="inline-block text-gray-400 mr-1">
                      {`${t("WRITTEN BY")}:`}
                    </div>
                    <div className="inline-block text-gray-400">
                      {uniqueWriters &&
                        uniqueWriters.map((guio, index) => (
                          <button
                            className={`inline-block ${
                              uniqueWriters &&
                              index !== uniqueWriters.length - 1
                                ? "pr-1"
                                : ""
                            } cursor-pointer text-gray-200 hover:text-gray-400`}
                            onClick={() => navigate(`/person/${guio.id}`)}
                            key={Math.floor(
                              (1 + index + Math.random()) * 0x10000
                            )}
                          >
                            {guio.name}
                            {uniqueWriters && index !== uniqueWriters.length - 1
                              ? ", "
                              : ""}
                          </button>
                        ))}
                    </div>
                    <div
                      className="inline-block"
                      key={Math.floor((1 + Math.random()) * 0x10000)}
                    >
                      {writers && writers.length > 3 ? (
                        <div className="inline-block">
                          {", "}
                          <button
                            className="transition ease-in-out text-purpleNR md:hover:text-gray-400 duration-300 cursor-pointer"
                            onClick={() => navigate(`/${media}/${id}/credits`)}
                          >
                            {t("more...")}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
                {/* //-PRODUCTION  */}
                {uniqueProductions && uniqueProductions.length > 0 ? (
                  <div className="flex flex-row text-sm mb-4">
                    <div className="inline-block text-gray-400 mr-1">
                      {uniqueProductions && uniqueProductions.length !== 0
                        ? `${t("PRODUCTION")}:`
                        : null}
                    </div>
                    <div className="inline-block pr-1 text-gray-400">
                      {[
                        uniqueProductions &&
                          uniqueProductions.map((caract, index) => (
                            <button
                              className={`inline-block ${
                                uniqueProductions &&
                                index !== uniqueProductions.length - 1
                                  ? "pr-1"
                                  : ""
                              } cursor-pointer text-gray-200 hover:text-gray-400`}
                              onClick={() => navigate(`/person/${caract.id}`)}
                              key={Math.floor(
                                (1 + index + Math.random()) * 0x10000
                              )}
                            >
                              {caract.name}
                              {uniqueProductions &&
                              index !== uniqueProductions.length - 1
                                ? ", "
                                : ""}
                            </button>
                          )),
                        <div
                          className="inline-block"
                          key={Math.floor((1 + Math.random()) * 0x10000)}
                        >
                          {productions && productions.length > 3 ? (
                            <div className="inline-block">
                              {", "}
                              <button
                                className="transition ease-in-out text-purpleNR md:hover:text-gray-400 duration-300 cursor-pointer"
                                onClick={() =>
                                  navigate(`/${media}/${id}/credits`)
                                }
                              >
                                {t("more...")}
                              </button>
                            </div>
                          ) : null}
                        </div>,
                      ]}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        {/* // - Complete equipment */}
        <div className="text-purpleNR mt-6 pr-4 text-right grid justify-center md:justify-end transition ease-in-out md:hover:text-gray-400 duration-300">
          <Link to={`/${media}/${id}/credits`}>
            {t("Delivery and complete equipment")}
            <BiSolidRightArrow
              className="ml-1 cursor-pointer inline-block"
              alt={t("Right arrow icon")}
            />
          </Link>
        </div>
        {/* //- MAIN CAST */}
        {modal !== true && items.length > 0 ? (
          <div className="text-gray-200 rounded-xl ">
            <div className="px-4">
              <CarouselCredits
                title={t("MAIN CAST")}
                info={items}
                media={media}
                id={id}
                nameFilm={processInfo.title}
              />
            </div>
          </div>
        ) : null}
        {/* //-COLLECTIONS / SEASONS */}
        <div className="text-lg">
          {modal !== true && processInfo.collection ? (
            <Collections
              idCollection={processInfo.collection.id}
              media={media}
            />
          ) : (
            seasons && (
              <Seasons
                info={seasons && seasons}
                idTvShow={id}
                dataUser={dataUser}
                runTime={processInfo.runTime[0]}
              />
            )
          )}
        </div>
        {/* //-SIMILAR */}
        <div className="text-lg pt-4">
          {!modal && info.id === id ? (
            <Similar
              title={media === "movie" ? t("Similar") : t("Recommendations")}
              id={id}
              media={media}
              lang={langApi}
            />
          ) : null}
        </div>
        {/* //-RECOMMENDATIONS */}
        <div className="text-lg pt-4 pb-6 mb-20">
          {!modal && info.id === id ? (
            <Recommendations
              title={media === "movie" ? t("Recommendations") : t("Similar")}
              id={id}
              media={media}
              lang={langApi}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}

export default DetailsMovie;

DetailsMovie.defaultProps = {
  info: {},
  crews: [],
  cast: [],
  media: "",
};
DetailsMovie.propTypes = {
  info: PropTypes.object,
  crews: PropTypes.array,
  cast: PropTypes.array,
  media: PropTypes.string,
};
