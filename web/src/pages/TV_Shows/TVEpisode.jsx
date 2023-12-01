import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
//-IMAGENES
import { BsAlarm, BsAlarmFill } from "react-icons/bs";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import CarouselCredits from "../../utils/Carousel/CarouselCredits";
import {
  getMediaDetails,
  getSeasonDetails,
} from "../../../services/TMDB/services-tmdb";
import { useTranslation } from "react-i18next";
import {
  deleteMedia,
  getDetailMedia,
  patchMedia,
  postMedia,
} from "../../../services/DB/services-db";
import DateAndTimeConvert from "../../utils/DateAndTimeConvert";
import {
  IoCheckmarkCircleOutline,
  IoCheckmarkCircleSharp,
} from "react-icons/io5";
import { useAuthContext } from "../../context/auth-context";
import { NoImageEpis } from "../../assets/image";

const TVEpisode = () => {
  const [t] = useTranslation("translation");
  const { user } = useAuthContext();
  const userExist = !!user;
  const { idTv, NSeason, idEpisode } = useParams();
  const navigate = useNavigate();
  const [season, setSeason] = useState([]);
  const [tvDetails, setTV] = useState([]);
  const [changeSeenPending, setChangeSeenPending] = useState(false);
  const [pendingSeen, setPendingSeen] = useState(false);
  useEffect(() => {
    const DataTV = async () => {
      getMediaDetails("tv", idTv, t("es-ES"))
        .then((data) => {
          setTV(data);
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
    if (NSeason) {
      DataSeason();
    }
  }, [idTv, NSeason, t]);

  //-BUSCAR EL EPISODe
  const episode =
    season.episodes &&
    season.episodes.filter((unepis) => unepis.id === Number(idEpisode));

  // ! USER COMPARATION
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
  //- VISTO/NO VISTO
  const handleSeenMedia = () => {
    if (Object.keys(dataMediaUser).length) {
      patchMedia(idTv, { seen: !seen }).then(
        () => setChangeSeenPending(!changeSeenPending),
        setPendingSeen(!pendingSeen)
      );
    } else {
      postMedia({
        mediaId: idTv,
        media_type: "tv",
        runtime: tvDetails.episode_run_time,
        like: false,
        seen: true,
      }).then((data) => {
        if (data) {
          setChangeSeenPending(!changeSeenPending),
            setPendingSeen(!pendingSeen);
        }
      });
    }
  };
  // - PENDING/NO PENDING
  const handlePending = () => {
    if (Object.keys(dataMediaUser).length) {
      patchMedia(idTv, { pending: !pending }).then(
        () => setChangeSeenPending(!changeSeenPending),
        setPendingSeen(!pendingSeen)
      );
    } else {
      postMedia({
        mediaId: idTv,
        media_type: "tv",
        runtime: tvDetails.episode_run_time,
        pending: true,
      }).then((data) => {
        if (data) {
          setChangeSeenPending(!changeSeenPending),
            setPendingSeen(!pendingSeen);
        }
      });
    }
  };
  document.title = `${episode.name}`;

  return (
    <div>
      {episode &&
        episode.map((episode, index) => {
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
          const directores = episode.crew.filter(
            (crew) => crew.department === "Directing"
          );
          const guionistas = episode.crew.filter(
            (crew) => crew.department === "Writing"
          );
          //-ID EPISODe ANTERIOR
          const EpAnterior = season.episodes.filter(
            (epi) => epi.episode_number === episode.episode_number - 1
          );
          const EpisAntID = EpAnterior.map((episID) => {
            return episID.id;
          });
          //-ID EPISODe SIGUIENTE
          const EpSiguiente = season.episodes.filter(
            (epi) => epi.episode_number === episode.episode_number + 1
          );
          const EpisSigID = EpSiguiente.map((episID) => {
            return episID.id;
          });

          return (
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
              key={index}
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
                    onClick={() =>
                      navigate(`/tv/${idTv}/${NSeason}/${EpisAntID[0]}`)
                    }
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
                    onClick={() =>
                      navigate(`/tv/${idTv}/${NSeason}/${EpisAntID[0]}`)
                    }
                  />
                  Temporada {NSeason}
                </button>
                {/* //.EPISODe ANTERIOR */}
                <button
                  className="ml-5 pt-5 text-gray-200  md:hover:text-purpleNR"
                  onClick={() =>
                    navigate(`/tv/${idTv}/${NSeason}/${EpisAntID[0]}`)
                  }
                >
                  {season.episodes.length - episode.episode_number ===
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
                  {season.episodes.length - episode.episode_number ===
                  season.episodes.length - 1
                    ? null
                    : "Episode " + (episode.episode_number - 1)}
                </button>
                <div className="inline-block px-2 text-gray-500">
                  {season.episodes.length === episode.episode_number ||
                  season.episodes.length - episode.episode_number ===
                    season.episodes.length - 1
                    ? null
                    : "<| |>"}
                </div>
                {/* //.EPISODe SIGUIENTE */}
                <button
                  className="pt-5 text-gray-200  md:hover:text-purpleNR"
                  onClick={() =>
                    navigate(`/tv/${idTv}/${NSeason}/${EpisSigID[0]}`)
                  }
                >
                  {season.episodes.length === episode.episode_number
                    ? null
                    : "Episode " + (episode.episode_number + 1)}
                  {season.episodes.length === episode.episode_number ? null : (
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
                                  onClick={handlePending}
                                />
                              </button>
                            ) : (
                              <button className="cursor-pointer transition ease-in-out md:hover:scale-110 duration-300">
                                <BsAlarmFill
                                  className="inline-block"
                                  size={17}
                                  color="#FFCA28"
                                  alt={t("No Pending")}
                                  onClick={handlePending}
                                />
                              </button>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <h1 className="font-semibold text-3xl my-2">
                      {episode.name}
                    </h1>
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
                    {directores.length === 0 ? null : (
                      <div className="pl-10 flex flex-row text-sm mb-4">
                        <div className="inline-block text-gray-400">
                          {directores.length === 0
                            ? null
                            : directores.length === 1
                            ? directores.map((guio, index) => {
                                return (
                                  <div key={index}>
                                    {guio.name && "DIRIGIDO POR: "}
                                  </div>
                                );
                              })
                            : "DIRIGIDO POR: "}
                        </div>

                        <div className="inline-block text-gray-400 pl-1">
                          {directores.length === 0
                            ? null
                            : directores.map((guio, index) => {
                                return (
                                  <div
                                    className="inline-block pr-1 cursor-pointer text-gray-200 hover:text-gray-500"
                                    onClick={() =>
                                      navigate(`/person/${guio.id}`)
                                    }
                                    key={index}
                                  >
                                    {guio.name}
                                    {index !== directores.length - 1
                                      ? ", "
                                      : ""}
                                  </div>
                                );
                              })}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* //-ESCRITO POR */}
                  <div className="">
                    {guionistas.length === 0 ? null : (
                      <div className="pl-10 flex flex-row text-sm mb-4">
                        <div className="inline-block text-gray-400">
                          {guionistas.length === 0
                            ? null
                            : guionistas.length === 1
                            ? guionistas.map((guio, index) => {
                                return (
                                  <div key={index}>
                                    {guio.name && "ESCRITO POR: "}
                                  </div>
                                );
                              })
                            : "ESCRITO POR: "}
                        </div>

                        <div className="inline-block text-gray-400 pl-1">
                          {guionistas.length === 0
                            ? null
                            : guionistas.map((guio, index) => {
                                return (
                                  <div
                                    className="inline-block pr-1 cursor-pointer text-gray-200 hover:text-gray-500"
                                    onClick={() =>
                                      navigate(`/person/${guio.id}`)
                                    }
                                    key={index}
                                  >
                                    {guio.name}
                                    {index !== guionistas.length - 1
                                      ? ", "
                                      : ""}
                                  </div>
                                );
                              })}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* //-REPARTO PRINCIPAL */}
                  <>
                    {episode.guest_stars.length === 0 ? null : (
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
          );
        })}
    </div>
  );
};

export default TVEpisode;
