import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { NoImage, tv } from "../../assets/image";
import { useTranslation } from "react-i18next";
import { getDetailMedia } from "../../../services/DB/services-db";
import SeenPending from "../MediaList/SeenPendingMedia/SeenPending";
import { useAuthContext } from "../../context/auth-context";
import SeenPendingButton from "../../utils/Buttons/SeenPendingButton";

export const SeasonList = ({ season, idTvShow, dataUser, runTime }) => {
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

  const NumberSeason = season_number;
  const idSeason = idInfo;
  const [pendingSeen, setPendingSeen] = useState(false);
  const [dataMediaUser, setDataMediaUser] = useState({});
  useEffect(() => {
    if (Object.keys(dataUser).length) {
      getDetailMedia(dataUser.id).then((d) => {
        setDataMediaUser(d);
      });
    }
  }, [pendingSeen, id, dataUser]);
  const { seen } = dataMediaUser;

  //- SEEN/NO SEEN
  const handleSeenMedia = (event) => {
    event.stopPropagation();
    SeenPending(
      dataMediaUser,
      id,
      "tv",
      runTime,
      seen,
      setPendingSeen,
      pendingSeen,
      "seen",
      onReload
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
                  season && navigate(`/tv/${idTvShow}/${NumberSeason}`)
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
                    season && navigate(`/tv/${idTvShow}/${NumberSeason}`)
                  }
                />
              </div>
            )}
          </div>
        </div>
        {/* //-DATE */}
        <div className="mt-4 px-2 ">
          <div className="flex justify-between items-center pb-2">
            <h2
              className="cursor-pointer font-semibold text-base"
              onClick={() =>
                season && navigate(`/tv/${idTvShow}/${NumberSeason}`)
              }
            >
              {name}
            </h2>
            <div className="text-right align-middle text-xs text-gray-500">
              {date !== null ? date : null}
            </div>
          </div>
          {/* //-SEASON */}
          <div className="text-xs text-left col-span-2 w-full inset-x-0 px:center text-[#7B6EF6] flex justify-between">
            <div
              className="cursor-pointer"
              onClick={() =>
                season &&
                navigate(`/tv/${idTvShow}/${NumberSeason}/${idSeason}`)
              }
            >
              {`${t("Episodes")}: ${numEpis}`}
            </div>

            <div className="inline-block">
              {/* //-SEEN/UNSEEN */}
              <div className="text-right align-middle">
                <SeenPendingButton
                  condition={seen}
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

export default SeasonList;

SeasonList.defaultProps = {
  season: {},
  idTvShow: 0,
  dataUser: {},
  runTime: 0,
};

SeasonList.propTypes = {
  season: PropTypes.object,
  idTvShow: PropTypes.number,
  dataUser: PropTypes.object,
  runTime: PropTypes.number,
};
