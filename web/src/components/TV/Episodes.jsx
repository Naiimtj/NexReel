import { useEffect } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import DateAndTimeConvert from "../../utils/DateAndTimeConvert";
// Img
import { BsAlarm, BsAlarmFill } from "react-icons/bs";
import {
  IoCheckmarkCircleOutline,
  IoCheckmarkCircleSharp,
} from "react-icons/io5";

const Episodes = ({ info, seen, pending, idTvShow, numSeason, userExist }) => {
  const [t] = useTranslation("translation");
  const navigate = useNavigate();
  const { name, air_date, episode_number, id } = info;
  //-SCROLL UP
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const NumberSeason = numSeason;
  const NumberEpisode = episode_number;
  const dateComplete =
    air_date &&
    new DateAndTimeConvert(
      air_date,
      t,
      false,
      false,
      false,
      true,
      false
    ).DateTimeConvert();
  const idEpi = id;
  const idEpis = idEpi;

  return (
    <div className="grid grid-cols-6 justify-items-stretch hover:bg-white/10 rounded-xl py-2">
      <div
        className="cursor-pointer grid grid-cols-5 col-span-5 grid-flow-col content-center"
        onClick={() =>
          info && navigate(`/tv/${idTvShow}/${NumberSeason}/${idEpis}`)
        }
      >
        {/* //-NUMBER EPISODE */}
        <div className="auto-cols-min">
          <h1 className="text-md text-center text-[#7B6EF6]">
            {NumberEpisode}
          </h1>
        </div>
        {/* //-NAME Y DATE */}
        <div className="px-2 col-span-3 grid content-center">
          {/* //-NAME */}
          <div className="items-stretch inline-block">
            <div className="">
              <h1 className="font-semibold text-sm pr-10">{name} </h1>
            </div>
          </div>
        </div>
        <div className="px-2 grid content-center">
          {/* //-DATE */}
          <div className="text-xs text-right">{dateComplete}</div>
        </div>
      </div>
      {/* //.BUTTON AND SEEN/UNSEEN */}
      {userExist ? (
        <div className="grid grid-cols-2 gap-4 justify-items-center justify-between">
          {/* //-SEEN/UNSEEN */}
          <div className="text-right flex items-center">
            {seen !== true ? (
              <button className="cursor-pointer transition ease-in-out md:hover:scale-110 duration-300">
                <IoCheckmarkCircleOutline
                  className="inline-block"
                  size={20}
                  color="#FFCA28"
                  alt={t("Seen")}
                  // onClick={handleSeenMedia}
                />
              </button>
            ) : (
              <button className="cursor-pointer transition ease-in-out md:hover:scale-110 duration-300">
                <IoCheckmarkCircleSharp
                  className="inline-block"
                  size={20}
                  color="#FFCA28"
                  alt={t("Unseen")}
                  // onClick={handleSeenMedia}
                />
              </button>
            )}
          </div>
          {/* //-PENDING/NO PENDING */}
          <div className="text-right align-middle">
            {pending !== true ? (
              <button className="cursor-pointer transition ease-in-out md:hover:scale-110 duration-300">
                <BsAlarm
                  className="inline-block"
                  size={17}
                  color="#FFCA28"
                  alt={t("Pending")}
                  // onClick={handlePending}
                />
              </button>
            ) : (
              <button className="cursor-pointer transition ease-in-out md:hover:scale-110 duration-300">
                <BsAlarmFill
                  className="inline-block"
                  size={17}
                  color="#FFCA28"
                  alt={t("No Pending")}
                  // onClick={handlePending}
                />
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Episodes;

Episodes.defaultProps = {
  info: {},
  seen: false,
  pending: false,
  idTvShow: "",
  numSeason: "",
  userExist: false,
};
Episodes.propTypes = {
  info: PropTypes.object,
  seen: PropTypes.bool,
  pending: PropTypes.bool,
  idTvShow: PropTypes.string,
  numSeason: PropTypes.string,
  userExist: PropTypes.bool,
};
