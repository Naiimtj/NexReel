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
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
// components
import DateAndTimeConvert from "../../utils/DateAndTimeConvert";
import { useAuthContext } from "../../context/auth-context";
import CarouselCredits from "../../utils/Carousel/CarouselCredits";
import PageTitle from "../../components/PageTitle";
import SeenPendingEpisode from "../../components/MediaList/SeenPendingMedia/SeenPendingEpisode";
import SeenPendingButton from "../../utils/Buttons/SeenPendingButton";

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
      getDetailMedia(idTv, "tv").then((d) => {
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
    episode.air_date &&
    new DateAndTimeConvert(
      episode.air_date,
      t,
      false,
      false,
      false,
      true,
      false
    ).DateTimeConvert();
  //-FILTROS
  const directed =
    episode &&
    episode.crew &&
    episode.crew.filter((crew) => crew.department === "Directing");
  const written =
    episode &&
    episode.crew &&
    episode.crew.filter((crew) => crew.department === "Writing");

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
          {/* //.BACK TV SHOW */}
          <button
            className="ml-5 pt-5 hover:text-purpleNR"
            onClick={() => navigate(`/tv/${idTv}`)}
          >
            <IoIosArrowBack
              className="inline-block mr-1"
              size={25}
              alt={`${t("Previous")} ${t("Tv Show")}`}
              onClick={() => navigate(`/tv/${idTv}`)}
            />
            {tvDetails.name}
          </button>
          {/* //.BACK SEASON */}
          <button
            className="ml-5 pt-5 hover:text-purpleNR"
            onClick={() => navigate(`/tv/${idTv}/${NSeason}`)}
          >
            <IoIosArrowBack
              className="inline-block mr-1"
              size={25}
              alt={`${t("Previous")} ${t("Season")}`}
              onClick={() => navigate(`/tv/${idTv}/${NSeason}`)}
            />
            {t("Season")} {NSeason}
          </button>
          {/* //.PREVIOUS EPISODE */}
          <button
            className="ml-5 pt-5 text-gray-200  md:hover:text-purpleNR"
            onClick={() =>
              navigate(`/tv/${idTv}/${NSeason}/${episode.episode_number - 1}`)
            }
          >
            {season.episodes &&
            season.episodes.length - episode.episode_number ===
              season.episodes &&
            season.episodes.length - 1 ? null : (
              <IoIosArrowBack
                className="inline-block mr-1"
                size={25}
                alt={`${t("Previous")} ${t("Episode")}`}
                onClick={() =>
                  navigate(
                    `/tv/${idTv}/${NSeason}/${episode.episode_number - 1}`
                  )
                }
              />
            )}
            {season.episodes &&
            season.episodes.length - episode.episode_number ===
              season.episodes &&
            season.episodes.length - 1
              ? null
              : `${t("Episode")} ${episode.episode_number - 1}`}
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
          {/* //.NEXT EPISODE */}
          <button
            className="pt-5 text-gray-200  md:hover:text-purpleNR"
            onClick={() =>
              navigate(`/tv/${idTv}/${NSeason}/${episode.episode_number + 1}`)
            }
          >
            {season.episodes &&
            season.episodes.length === episode.episode_number
              ? null
              : `${t("Episode")} ${episode.episode_number + 1}`}
            {season.episodes &&
            season.episodes.length === episode.episode_number ? null : (
              <IoIosArrowForward
                className="inline-block mr-1"
                size={25}
                alt={`${t("Next")} ${t("Episode")}`}
                onClick={() =>
                  navigate(
                    `/tv/${idTv}/${NSeason}/${episode.episode_number + 1}`
                  )
                }
              />
            )}
          </button>
          {/* // EPISODE INFO */}
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
                      <SeenPendingButton
                        condition={seen}
                        size={20}
                        text={t("Seen")}
                        handle={handleSeenMedia}
                      />
                    </div>
                    {/* //-PENDING/NO PENDING */}
                    <div className="col-start-3 text-center align-middle">
                      <SeenPendingButton
                        condition={pending}
                        size={17}
                        text={t("Pending")}
                        handle={handleSeenMedia}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
              {/* //-EPISODE NAME*/}
              <h1 className="font-semibold text-3xl my-2">{episode.name}</h1>
            </div>
            <div className="px-2">
              {/* //-EPISODE NAME Y Nº EPISODE */}
              <p className="text-gray-500">
                {season.name} / {"Episode "}
                {episode.episode_number}
              </p>
            </div>
            {/* //-SEASON DATA AND SYNOPSIS */}
            <div className="text-gray-200 rounded-xl mb-10 w-full">
              <div className="pl-10 text-lg">
                <div className="text-xs text-right text-gray-400">
                  {t("Issued")}: {dateSeason}
                </div>
                <h1 className="mt-4">
                  {episode.overview === ""
                    ? t("No Information")
                    : episode.overview}
                </h1>
              </div>
            </div>
            {/* //-DIRECTED BY */}
            {directed && directed.length === 0 ? null : (
              <div className="pl-10 flex flex-row text-sm mb-4">
                <div className="inline-block text-gray-400">
                  {directed && directed.length === 0
                    ? null
                    : directed && directed.length === 1
                    ? directed &&
                      directed.map((direct, index) => {
                        return (
                          <div key={index}>
                            {direct.name && `${t("DIRECTED BY")}: `}
                          </div>
                        );
                      })
                    : `${t("DIRECTED BY")}: `}
                </div>
                <div className="inline-block text-gray-400 pl-1">
                  {directed && directed.length === 0
                    ? null
                    : directed &&
                      directed.map((direct, index) => {
                        return (
                          <div
                            className="inline-block pr-1 cursor-pointer text-gray-200 hover:text-gray-500"
                            onClick={() => navigate(`/person/${direct.id}`)}
                            key={index}
                          >
                            {direct.name}
                            {index !== directed.length - 1 ? ", " : ""}
                          </div>
                        );
                      })}
                </div>
              </div>
            )}
            {/* //-WRITTEN BY */}
            {written && written.length === 0 ? null : (
              <div className="pl-10 flex flex-row text-sm mb-4">
                <div className="inline-block text-gray-400">
                  {written && written.length === 0
                    ? null
                    : written && written.length === 1
                    ? written &&
                      written.map((writer, index) => {
                        return (
                          <div key={index}>
                            {writer.name && `${t("WRITTEN BY")}: `}
                          </div>
                        );
                      })
                    : `${t("WRITTEN BY")}: `}
                </div>
                <div className="inline-block text-gray-400 pl-1">
                  {written && written.length === 0
                    ? null
                    : written &&
                      written.map((writer, index) => {
                        return (
                          <div
                            className="inline-block pr-1 cursor-pointer text-gray-200 hover:text-gray-500"
                            onClick={() => navigate(`/person/${writer.id}`)}
                            key={index}
                          >
                            {writer.name}
                            {index !== written.length - 1 ? ", " : ""}
                          </div>
                        );
                      })}
                </div>
              </div>
            )}
            {/* //-REPARTO PRINCIPAL */}
            {episode &&
            episode.guest_stars &&
            episode.guest_stars.length === 0 ? null : (
              <div className="text-gray-200 rounded-xl mb-10 ">
                <CarouselCredits
                  title={t("MAIN CAST")}
                  info={episode.guest_stars}
                  media={"tv"}
                  id={Number(idTv)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TVEpisode;
