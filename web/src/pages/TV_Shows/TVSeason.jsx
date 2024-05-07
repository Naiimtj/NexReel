import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getMediaDetails,
  getSeasonDetails,
} from "../../../services/TMDB/services-tmdb";
import { useTranslation } from "react-i18next";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useAuthContext } from "../../context/auth-context";
import { getDetailSeasons } from "../../../services/DB/services-db";
import { NoImage, tv } from "../../assets/image";
import {
  IoCheckmarkCircleOutline,
  IoCheckmarkCircleSharp,
} from "react-icons/io5";
import { BsAlarm, BsAlarmFill } from "react-icons/bs";
import DateAndTimeConvert from "../../utils/DateAndTimeConvert";
import Episodes from "../../components/TV/Episodes";
import PageTitle from "../../components/PageTitle";
import SeenPendingSeason from "../../components/MediaList/SeenPendingMedia/SeenPendingSeason";

const TVSeason = () => {
  const { user, onReload } = useAuthContext();
  const userExist = !!user;
  const [t] = useTranslation("translation");
  const { idTv, NSeason } = useParams();
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
  const { seen, pending, runtime, number_seasons, number_of_episodes } =
    dataMediaUser;
  const runTimeSeason =
    season && season.episodes && season.episodes.length * runtime;
  const TotalTime =
    runTimeSeason > 0
      ? new DateAndTimeConvert(runTimeSeason, t, false).TimeConvert()
      : 0;
  //- SEEN/NO SEEN
  const handleSeenMedia = (event) => {
    event.stopPropagation();
    new SeenPendingSeason(
      dataMediaUser,
      idTv,
      "tv",
      runTimeSeason || 0,
      seen,
      setChangeSeenPending,
      changeSeenPending,
      setPendingSeen,
      pendingSeen,
      "seen",
      onReload,
      NSeason,
      number_of_episodes,
      number_seasons
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
      false
    ).DateTimeConvert();
  //-ID EPISODE BEFORE
  const SeasonBefore =
    tvDetails.seasons &&
    tvDetails.seasons.filter(
      (seas) => seas.season_number === Number(NSeason) - 1
    );
  //-ID EPISODE NEXT
  const SeasonAfter =
    tvDetails.seasons &&
    tvDetails.seasons.filter(
      (seas) => seas.season_number === Number(NSeason) + 1
    );

  return (
    <div
      className="rounded-3xl bg-contain bg-center w-full h-auto my-6 static"
      style={{
        backgroundImage: `url(${url})`,
      }}
    >
      <PageTitle title={`${season.name}`} />
      <div className="text-gray-200 pt-5 w-auto bg-local backdrop-blur-3xl bg-[#20283E]/80 rounded-3xl">
        {/* // * BACK TV SHOW */}
        <button
          className="ml-5 pt-5 hover:text-purpleNR"
          onClick={() => idTv && navigate(`/tv/${idTv}`)}
        >
          <IoIosArrowBack
            className="inline-block mr-1"
            size={25}
            alt={t("Before")}
            onClick={() => idTv && navigate(`/tv/${idTv}`)}
          />
          {tvDetails.name}
        </button>
        {/* // * SEASON BEFORE */}
        <button
          className="ml-5 text-gray-200  md:hover:text-purpleNR"
          onClick={() =>
            SeasonBefore &&
            SeasonBefore.length > 0 &&
            navigate(`/tv/${idTv}/${Number(NSeason) - 1}`)
          }
        >
          {SeasonBefore && SeasonBefore.length > 0 ? (
            <IoIosArrowBack
              className="inline-block mr-1"
              size={25}
              alt={t("Before Season Icon")}
              onClick={() => navigate(`/tv/${idTv}/${Number(NSeason) - 1}`)}
            />
          ) : null}

          {SeasonBefore && SeasonBefore.length > 0
            ? `${t("Season")} ${Number(NSeason) - 1}`
            : null}
        </button>
        {/* // MIDDLE */}
        <div className="inline-block px-2 text-gray-500">
          {SeasonBefore && SeasonBefore.length > 0
            ? tvDetails.seasons[0].season_number === 0
              ? tvDetails.seasons.length - 1 === Number(NSeason) ||
                tvDetails.seasons.length - 1 - NSeason ===
                  tvDetails.seasons.length - 1
                ? null
                : "<| |>"
              : SeasonAfter.length === 0
              ? tvDetails.seasons.length === NSeason ||
                tvDetails.seasons.length - NSeason ===
                  tvDetails.seasons.length - 1
                ? null
                : "<| |>"
              : null
            : null}
        </div>
        {/* // * SEASON AFTER */}
        <button
          className="text-gray-200 md:hover:text-purpleNR"
          onClick={() =>
            SeasonAfter &&
            SeasonAfter.length > 0 &&
            navigate(`/tv/${idTv}/${Number(NSeason) + 1}`)
          }
        >
          {SeasonAfter && SeasonAfter.length > 0
            ? `${t("Season")} ${Number(NSeason) + 1}`
            : null}
          {SeasonAfter && SeasonAfter.length > 0 ? (
            <IoIosArrowForward
              className="inline-block mr-1"
              size={25}
              alt={t("After Season Icon")}
              onClick={() => navigate(`/tv/${idTv}/${Number(NSeason) + 1}`)}
            />
          ) : null}
        </button>
        <div className="h-full w-full grid md:grid-cols-3 justify-items-stretch gap-4 p-2 md:pt-4 md:px-4">
          <div className="row-span-2 rounded-xl grid justify-items-center content-start mt-8">
            {season.poster_path ? (
              <img
                className=" rounded-xl flex justify-center "
                src={url}
                alt={season.name}
              />
            ) : (
              <div className="relative flex justify-center items-center">
                <img
                  className="absolute h-24 opacity-10"
                  src={tv}
                  alt={t("Icon people")}
                />
                <img
                  className="rounded-xl flex justify-center"
                  src={url}
                  alt={t("No photo")}
                />
              </div>
            )}
            {/* // . BUTTON SEEN/UNSEEN & NO BUTTON PENDING/UNPENDING */}
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
                    <BsAlarm
                      className="inline-block"
                      size={17}
                      color="#FFCA28"
                      alt={t("Pending")}
                      onClick={handleSeenMedia}
                    />
                  ) : (
                    <BsAlarmFill
                      className="inline-block"
                      size={17}
                      color="#FFCA28"
                      alt={t("No Pending")}
                      onClick={handleSeenMedia}
                    />
                  )}
                </div>
              </div>
            ) : null}
          </div>
          {/* //-SEASON NAME AND DATE */}
          <div className="col-span-2 px-2">
            <div className="flex justify-between items-stretch pb-4">
              <div className="flex text-4xl items-center">
                <h1 className="font-semibold pr-2">{season.name}</h1>
                <p className="text-xl">{`(${
                  season.episodes && season.episodes.length
                } ${t("episodes")})`}</p>
                <p className="text-xs ml-1">{TotalTime}</p>
              </div>
              {dateSeason ? <div className="text-xs">{dateSeason}</div> : null}
            </div>
            {/* //-EPISODES */}
            <div className="text-gray-200 rounded-xl mb-10 w-full">
              <div className="pl-10 text-lg grid grid-rows-1 justify-items-stretch">
                <h1>{t("Episodes")}</h1>
                {season.episodes &&
                  season.episodes.map((episode, key) => {
                    return (
                      <Episodes
                        key={key}
                        info={episode}
                        addButton={true}
                        seen={seen}
                        pending={pending}
                        idTvShow={idTv}
                        numSeason={NSeason}
                        userExist={userExist}
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
