import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { NoImage } from "../../assets/image";
import { useTranslation } from "react-i18next";
import {
  IoCheckmarkCircleOutline,
  IoCheckmarkCircleSharp,
} from "react-icons/io5";
import {
  getDetailMedia,
  patchMedia,
  postMedia,
} from "../../../services/DB/services-db";

export const SeasonList = ({ season, idSerie, dataUser, runTime }) => {
  const [t] = useTranslation("translation");
  const navegate = useNavigate();
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
  const url =
    poster_path !== undefined
      ? `https://www.themoviedb.org/t/p/w300_and_h450_bestv2${poster_path}`
      : null;
  const poster = poster_path !== null ? url : NoImage;
  const nombre = name && name;
  const fecha =
    air_date === ""
      ? null
      : air_date === undefined
      ? ""
      : air_date === null
      ? ""
      : new Date(air_date).getFullYear();
  const numEpis = episode_count;
  const idInfo = id;

  const NSeason = season_number;
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
  const handleSeenMedia = () => {
    if (Object.keys(dataMediaUser).length) {
      patchMedia(id, { seen: !seen }).then(() => setPendingSeen(!pendingSeen));
    } else {
      postMedia({
        mediaId: id,
        media_type: "tv",
        runtime: runTime,
        like: false,
        seen: true,
      }).then((data) => {
        if (data) {
          setPendingSeen(!pendingSeen);
        }
      });
    }
  };

  return (
    <div className="static text-gray-200 rounded-xl bg-cover w-full">
      <div className="cursor-pointer p-2 backdrop-blur-md rounded-xl h-full">
        <div className="flex justify-center">
          {/* //-PORTADA*/}
          <div className="transition ease-in-out md:hover:scale-105 duration-100 ">
            <img
              className="static aspect-auto rounded-xl justify-center"
              src={poster}
              alt={nombre}
              onClick={() => season && navegate(`/tv/${idSerie}/${NSeason}`)}
            />
          </div>
        </div>
        {/* //-FECHA */}
        <div className="mt-4 px-2 ">
          <div className="mb-1 ">
            <div className="text-right align-middle text-xs text-gray-500">
              {fecha !== null ? fecha : null}
            </div>
          </div>
          <h2
            className="cursor-pointer font-semibold text-base pb-2"
            onClick={() => season && navegate(`/tv/${idSerie}/${NSeason}`)}
          >
            {nombre}
          </h2>
          {/* //-TEMPORADA */}
          <div className="text-xs text-left col-span-2 w-full inset-x-0 px:center text-[#7B6EF6] flex justify-between">
            <div
              className="cursor-pointer"
              onClick={() =>
                season && navegate(`/tv/${idSerie}/${NSeason}/${idSeason}`)
              }
            >
              {`${t("Episodes")}: ${numEpis}`}
            </div>

            <div className="inline-block">
              {/* //-SEEN/UNSEEN */}
              <div className="text-right align-middle">
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
  idSerie: 0,
  dataUser: {},
  runTime: 0,
};

SeasonList.propTypes = {
  season: PropTypes.object,
  idSerie: PropTypes.number,
  dataUser: PropTypes.object,
  runTime: PropTypes.number,
};
