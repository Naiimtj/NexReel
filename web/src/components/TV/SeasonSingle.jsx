import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { NoImage, tv } from "../../assets/image";
import { useTranslation } from "react-i18next";
import { getDetailSeasons } from "../../../services/DB/services-db";
import { useAuthContext } from "../../context/auth-context";
import SeenPendingSeason from "../MediaList/SeenPendingMedia/SeenPendingSeason";
import SeenPendingButton from "../../utils/Buttons/SeenPendingButton";

export const SeasonSingle = ({
  season,
  idTvShow,
  mediaIsPending,
  mediaIsSeen,
  runTime,
  setChangeSeenPending,
  changeSeenPending,
  numberEpisodes,
  numberSeasons,
  runTimeSeason,
}) => {
  const [t] = useTranslation("translation");
  const { onReload } = useAuthContext();
  const navigate = useNavigate();
  const {
    //.TV
    name,
    poster_path,
    season_number,
    episode_count,
    air_date,
    //.Default
    id,
  } = season;
  const url = poster_path
    ? `https://www.themoviedb.org/t/p/w300_and_h450_bestv2${poster_path}`
    : null;
  const poster = poster_path ? url : NoImage;
  const date =
    air_date === ""
      ? null
      : air_date === undefined
      ? ""
      : air_date === null
      ? ""
      : new Date(air_date).getFullYear();
  const numEpis = episode_count;
  const idInfo = id;
  const idSeason = idInfo;

  const [pendingSeen, setPendingSeen] = useState(false);
  const [dataMediaUser, setDataMediaUser] = useState([]);
  useEffect(() => {
    if (mediaIsPending) {
      getDetailSeasons(idTvShow, season_number).then((d) => {
        setDataMediaUser(d);
      });
    }
  }, [
    mediaIsPending,
    pendingSeen,
    changeSeenPending,
    onReload,
    idTvShow,
    season_number,
  ]);

  const seasonSeen =
    (mediaIsPending && dataMediaUser && dataMediaUser.seen) ||
    (!mediaIsPending && mediaIsSeen);
  // console.log(seasonSeen);
  // console.log(dataMediaUser);
  //- SEEN/NO SEEN
  const handleSeenMedia = (event) => {
    event.stopPropagation();
    SeenPendingSeason(
      dataMediaUser,
      idTvShow,
      "tv",
      runTime,
      seasonSeen,
      setChangeSeenPending,
      changeSeenPending,
      setPendingSeen,
      pendingSeen,
      "seen",
      onReload,
      season_number,
      numberEpisodes,
      numberSeasons,
      runTimeSeason
    );
  };

  return (
    <div className="static text-gray-200 rounded-xl bg-cover w-full">
      <div className="cursor-pointer p-2 backdrop-blur-md rounded-xl h-full">
        <div className="flex justify-center">
          {/* //-POSTER*/}
          <div className="transition ease-in-out md:hover:scale-105 duration-100 ">
            {poster_path ? (
              <img
                className="static aspect-auto rounded-xl justify-center"
                src={poster}
                alt={name}
                onClick={() =>
                  season && navigate(`/tv/${idTvShow}/${season_number}`)
                }
              />
            ) : (
              <div className="relative flex justify-center items-center">
                <img
                  className="absolute h-24 opacity-10"
                  src={tv}
                  alt={t("Icon people")}
                />
                <img
                  className="static aspect-auto rounded-xl justify-center"
                  src={poster}
                  alt={name}
                  onClick={() =>
                    season && navigate(`/tv/${idTvShow}/${season_number}`)
                  }
                />
              </div>
            )}
          </div>
        </div>
        {/* //-DATA OF SEASON */}
        <div className="mt-4 px-2 ">
          <div className="flex justify-between items-center pb-2">
            <h2
              className="cursor-pointer font-semibold text-base"
              onClick={() =>
                season && navigate(`/tv/${idTvShow}/${season_number}`)
              }
            >
              {name}
            </h2>
            <div className="text-right align-middle text-xs text-gray-500">
              {date !== null ? date : null}
            </div>
          </div>
          <div className="text-xs text-left col-span-2 w-full inset-x-0 px:center text-[#7B6EF6] flex justify-between">
            {/* //-EPISODES */}
            <div
              className="cursor-pointer"
              onClick={() =>
                season &&
                navigate(`/tv/${idTvShow}/${season_number}/${idSeason}`)
              }
            >
              {`${t("Episodes")}: ${numEpis}`}
            </div>

            {/* //-SEEN/UNSEEN */}
            <div className="inline-block">
              <div className="text-right align-middle">
                <SeenPendingButton
                  condition={seasonSeen}
                  size={20}
                  text={"Seen"}
                  handle={handleSeenMedia}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeasonSingle;

SeasonSingle.defaultProps = {
  season: {},
  idTvShow: 0,
  mediaIsPending: false,
  mediaIsSeen: false,
  runTime: 0,
  setChangeSeenPending: () => {},
  changeSeenPending: false,
  numberEpisodes: 0,
  numberSeasons: 0,
  runTimeSeason: [],
};

SeasonSingle.propTypes = {
  season: PropTypes.object,
  idTvShow: PropTypes.number,
  mediaIsPending: PropTypes.bool,
  mediaIsSeen: PropTypes.bool,
  runTime: PropTypes.number,
  setChangeSeenPending: PropTypes.func,
  changeSeenPending: PropTypes.bool,
  numberEpisodes: PropTypes.number,
  numberSeasons: PropTypes.number,
  runTimeSeason: PropTypes.array,
};
