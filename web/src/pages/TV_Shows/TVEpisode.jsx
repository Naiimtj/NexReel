import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
// services
import {
  getEpisodeDetails,
  getMediaDetails,
  getSeasonDetails,
} from "../../../services/TMDB/services-tmdb";
import { deleteMedia, getDetailMedia } from "../../../services/DB/services-db";
// img
import { NoImageEpis } from "../../assets/image";
import { BsAlarm, BsAlarmFill } from "react-icons/bs";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import {
  IoCheckmarkCircleOutline,
  IoCheckmarkCircleSharp,
} from "react-icons/io5";
// components
import DateAndTimeConvert from "../../utils/DateAndTimeConvert";
import { useAuthContext } from "../../context/auth-context";
import CarouselCredits from "../../utils/Carousel/CarouselCredits";
import PageTitle from "../../components/PageTitle";
import SeenPendingEpisode from "../../components/MediaList/SeenPendingMedia/SeenPendingEpisode";

const TVEpisode = () => {
  const [t] = useTranslation("translation");
  const { user } = useAuthContext();
  const userExist = !!user;
  const { idTv, NSeason, idEpisode } = useParams();
  const navigate = useNavigate();
  const [season, setSeason] = useState([]);
  const [episode, setEpisode] = useState([]);
  const [tvDetails, setTvDetails] = useState([]);
  const [changeSeenPending, setChangeSeenPending] = useState(false);
  const [pendingSeen, setPendingSeen] = useState(false);
  useEffect(() => {
    const DataTV = async () => {
      getMediaDetails("tv", idTv, t("es-ES"))
        .then((data) => {
          setTvDetails(data);
        })
        .catch((err) => err);
    };
    if (idTv) {
      DataTV();
    }
    const DataSeason = async () => {
      getSeasonDetails(idTv, NSeason, t("es-ES"))
        .then((data) => {
          setSeason(data);
        })
        .catch((err) => err);
    };
    if (idTv && NSeason) {
      DataSeason();
    }
    const DataEpisode = async () => {
      getEpisodeDetails(idTv, NSeason, idEpisode, t("es-ES"))
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
      getDetailMedia(idTv).then((d) => {
        setDataMediaUser(d);
      });
    }
  }, [changeSeenPending, pendingSeen, idTv, userExist]);
  const { like, seen, pending, vote } = dataMediaUser;
  useEffect(() => {
    if (userExist && !like && !seen && !pending && vote === -1) {
      deleteMedia(idTv).then(() => {
        setChangeSeenPending(!changeSeenPending);
        setPendingSeen(!pendingSeen);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataMediaUser]);
  //- SEEN/NO SEEN
  const handleSeenMedia = () => {
    new SeenPendingEpisode(
      dataMediaUser,
      idTv,
      "tv",
      tvDetails.episode_run_time,
      seen,
      setChangeSeenPending,
      changeSeenPending,
      setPendingSeen,
      pendingSeen
    );
  };
  const url =
    episode.still_path !== undefined
      ? `https://image.tmdb.org/t/p/w500${episode.still_path}`
      : null;
  const dateSeason =
    season.air_date &&
    new DateAndTimeConvert(
      season.air_date,
      t,
      false,
      false,
      false,
      true,
      false
    ).DateTimeConvert();
  //-FILTROS
  const directores =
    episode &&
    episode.crew &&
    episode.crew.filter((crew) => crew.department === "Directing");
  const guionistas =
    episode &&
    episode.crew &&
    episode.crew.filter((crew) => crew.department === "Writing");
  console.log(season);
  //-ID EPISODe ANTERIOR
  const EpAnterior =
    episode &&
    season &&
    season.episodes &&
    season.episodes.filter(
      (epi) => epi.episode_number === episode.episode_number - 1
    );
  const EpisAntID =
    EpAnterior &&
    EpAnterior.map((episID) => {
      return episID.id;
    });
  //-ID EPISODe SIGUIENTE
  const EpSiguiente =
    episode &&
    season &&
    season.episodes &&
    season.episodes.filter(
      (epi) => epi.episode_number === episode.episode_number + 1
    );
  const EpisSigID =
    EpSiguiente &&
    EpSiguiente.map((episID) => {
      return episID.id;
    });
  return (
    <div>
      <PageTitle title={`${episode.name}`} />
      <div
        className="rounded-3xl bg-contain bg-center bg-fixed w-auto h-auto mt-6 mb-20"
        style={{
          backgroundImage:
            episode.still_path !== undefined
              ? episode.still_path !== null
                ? `url(https://image.tmdb.org/t/p/original${episode.still_path})`
                : null
              : null,
        }}
      >
        <div className="text-gray-200 w-auto bg-local backdrop-blur-3xl bg-[#20283E]/80 rounded-3xl">
          {/* //.VOLVER A SERIE */}
          <button
            className="ml-5 pt-5 hover:text-purpleNR"
            onClick={() => navigate(`/tv/${idTv}`)}
          >
            <IoIosArrowBack
              className="inline-block mr-1"
              size={25}
              alt="Antes"
              onClick={() => navigate(`/tv/${idTv}/${NSeason}/${EpisAntID[0]}`)}
            />
            {tvDetails.name}
          </button>
          {/* //.VOLVER A TEMPORADA */}
          <button
            className="ml-5 pt-5 hover:text-purpleNR"
            onClick={() => navigate(`/tv/${idTv}/${NSeason}`)}
          >
            <IoIosArrowBack
              className="inline-block mr-1"
              size={25}
              alt="Antes"
              onClick={() => navigate(`/tv/${idTv}/${NSeason}/${EpisAntID[0]}`)}
            />
            Temporada {NSeason}
          </button>
          {/* //.EPISODe ANTERIOR */}
          <button
            className="ml-5 pt-5 text-gray-200  md:hover:text-purpleNR"
            onClick={() => navigate(`/tv/${idTv}/${NSeason}/${EpisAntID[0]}`)}
          >
            {season.episodes &&
            season.episodes.length - episode.episode_number ===
              season.episodes &&
            season.episodes.length - 1 ? null : (
              <IoIosArrowBack
                className="inline-block mr-1"
                size={25}
                alt="Antes"
                onClick={() =>
                  navigate(`/tv/${idTv}/${NSeason}/${EpisAntID[0]}`)
                }
              />
            )}
            {season.episodes &&
            season.episodes.length - episode.episode_number ===
              season.episodes &&
            season.episodes.length - 1
              ? null
              : "Episode " + (episode.episode_number - 1)}
          </button>
          <div className="inline-block px-2 text-gray-500">
            {(season.episodes &&
              season.episodes.length === episode.episode_number) ||
            (season.episodes &&
              season.episodes.length - episode.episode_number ===
                season.episodes &&
              season.episodes.length - 1)
              ? null
              : "<| |>"}
          </div>
          {/* //.EPISODe SIGUIENTE */}
          <button
            className="pt-5 text-gray-200  md:hover:text-purpleNR"
            onClick={() => navigate(`/tv/${idTv}/${NSeason}/${EpisSigID[0]}`)}
          >
            {season.episodes &&
            season.episodes.length === episode.episode_number
              ? null
              : "Episode " + (episode.episode_number + 1)}
            {season.episodes &&
            season.episodes.length === episode.episode_number ? null : (
              <IoIosArrowForward
                className="inline-block mr-1"
                size={25}
                alt="Despues"
                onClick={() =>
                  navigate(`/tv/${idTv}/${NSeason}/${EpisSigID[0]}`)
                }
              />
            )}
          </button>
          {/* // INFORMACIÓN EPISODe */}
          <div className="static h-full w-full p-2 md:pt-4 md:px-4 mt-6">
            <div className="rounded-xl grid grid-rows-1 justify-items-center">
              <img
                className="rounded-xl"
                src={url === null ? NoImageEpis : url}
                alt={season.name}
              />
              <div className="grid grid-cols-2 gap-4 justify-between text-center mt-5">
                {/* // . BUTTON SEEN/UNSEEN & PENDING/UNPENDING */}
                {userExist ? (
                  <div className="mb-1 grid grid-cols-3 gap-2 top-0 w-full pr-4">
                    {/* //-SEEN/UNSEEN */}
                    <div className="text-center align-middle">
                      {seen !== true ? (
                        <button className="cursor-pointer transition ease-in-out md:hover:scale-110 duration-300">
                          <IoCheckmarkCircleOutline
                            className="inline-block"
                            size={20}
                            color="#FFCA28"
                            alt={t("Seen")}
                            onClick={handleSeenMedia}
                          />
                        </button>
                      ) : (
                        <button className="cursor-pointer transition ease-in-out md:hover:scale-110 duration-300">
                          <IoCheckmarkCircleSharp
                            className="inline-block"
                            size={20}
                            color="#FFCA28"
                            alt={t("Unseen")}
                            onClick={handleSeenMedia}
                          />
                        </button>
                      )}
                    </div>
                    {/* //-PENDING/NO PENDING */}
                    <div className="col-start-3 text-center align-middle">
                      {pending !== true ? (
                        <button className="cursor-pointer transition ease-in-out md:hover:scale-110 duration-300">
                          <BsAlarm
                            className="inline-block"
                            size={17}
                            color="#FFCA28"
                            alt={t("Pending")}
                            onClick={handleSeenMedia}
                          />
                        </button>
                      ) : (
                        <button className="cursor-pointer transition ease-in-out md:hover:scale-110 duration-300">
                          <BsAlarmFill
                            className="inline-block"
                            size={17}
                            color="#FFCA28"
                            alt={t("No Pending")}
                            onClick={handleSeenMedia}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
              <h1 className="font-semibold text-3xl my-2">{episode.name}</h1>
            </div>
            <div className=" px-2 ">
              {/* //-NOMBRE Y Nº EPISODe */}
              <div className="">
                <div className="">
                  <p className="text-gray-500">
                    {season.name} / {"Episode "}
                    {episode.episode_number}
                  </p>
                </div>
              </div>
            </div>
            {/* //-dateSeason Y SINOPSIS */}
            <div className="text-gray-200 rounded-xl mb-10 w-full">
              <div className="pl-10 text-lg">
                <div className="text-xs text-right text-gray-400">
                  Emitido: {dateSeason}
                </div>
                <h1 className="mt-4 ">
                  {episode.overview === ""
                    ? "Sin Información"
                    : episode.overview}
                </h1>
              </div>
              <div className=""></div>
            </div>
            {/* //-DIRIGIDO POR */}
            <div className="">
              {directores && directores.length === 0 ? null : (
                <div className="pl-10 flex flex-row text-sm mb-4">
                  <div className="inline-block text-gray-400">
                    {directores && directores.length === 0
                      ? null
                      : directores && directores.length === 1
                      ? directores &&
                        directores.map((guio, index) => {
                          return (
                            <div key={index}>
                              {guio.name && "DIRIGIDO POR: "}
                            </div>
                          );
                        })
                      : "DIRIGIDO POR: "}
                  </div>

                  <div className="inline-block text-gray-400 pl-1">
                    {directores && directores.length === 0
                      ? null
                      : directores &&
                        directores.map((guio, index) => {
                          return (
                            <div
                              className="inline-block pr-1 cursor-pointer text-gray-200 hover:text-gray-500"
                              onClick={() => navigate(`/person/${guio.id}`)}
                              key={index}
                            >
                              {guio.name}
                              {index !== directores.length - 1 ? ", " : ""}
                            </div>
                          );
                        })}
                  </div>
                </div>
              )}
            </div>
            {/* //-ESCRITO POR */}
            <div className="">
              {guionistas && guionistas.length === 0 ? null : (
                <div className="pl-10 flex flex-row text-sm mb-4">
                  <div className="inline-block text-gray-400">
                    {guionistas && guionistas.length === 0
                      ? null
                      : guionistas && guionistas.length === 1
                      ? guionistas &&
                        guionistas.map((guio, index) => {
                          return (
                            <div key={index}>
                              {guio.name && "ESCRITO POR: "}
                            </div>
                          );
                        })
                      : "ESCRITO POR: "}
                  </div>

                  <div className="inline-block text-gray-400 pl-1">
                    {guionistas && guionistas.length === 0
                      ? null
                      : guionistas &&
                        guionistas.map((guio, index) => {
                          return (
                            <div
                              className="inline-block pr-1 cursor-pointer text-gray-200 hover:text-gray-500"
                              onClick={() => navigate(`/person/${guio.id}`)}
                              key={index}
                            >
                              {guio.name}
                              {index !== guionistas.length - 1 ? ", " : ""}
                            </div>
                          );
                        })}
                  </div>
                </div>
              )}
            </div>
            {/* //-REPARTO PRINCIPAL */}
            <>
              {episode &&
              episode.guest_stars &&
              episode.guest_stars.length === 0 ? null : (
                <div className="text-gray-200 rounded-xl mb-10 ">
                  <div className="">
                    <CarouselCredits
                      title={t("MAIN CAST")}
                      info={episode.guest_stars}
                      media={"tv"}
                      id={Number(idTv)}
                    />
                  </div>
                </div>
              )}
            </>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TVEpisode;
