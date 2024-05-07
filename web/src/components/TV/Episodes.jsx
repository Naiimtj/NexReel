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
  const { name, runtime, air_date, episode_number, id } = info;
  const TotalTime =
    runtime > 0 ? new DateAndTimeConvert(runtime, t, false).TimeConvert() : 0;
  //-SCROLL UP
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

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

  return (
    <div className="grid grid-cols-6 justify-items-stretch hover:bg-white/10 rounded-xl py-2">
      <div
        className="cursor-pointer grid grid-cols-8 col-span-5 grid-flow-col content-center"
        onClick={() =>
          info && navigate(`/tv/${idTvShow}/${numSeason}/${episode_number}`)
        }
      >
        {/* //-NUMBER EPISODE */}
        <h1 className="text-md text-center text-[#7B6EF6]">{episode_number}</h1>
        {/* //-NAME Y DATE */}
        <div className="px-2 col-span-5 content-center">
          {/* //-NAME */}
          <div className="flex justify-start">
            <h1 className="font-semibold text-sm">{name}</h1>
          </div>
        </div>
        <div className="col-span-2 flex justify-end items-center gap-1 text-xs text-right px-2 content-center">
          {/* //-DATE */}

          <div className="">
            <p className="text-[10px] text-gray-400">({TotalTime})</p>
            {dateComplete}
          </div>
        </div>
      </div>
      {/* //.BUTTON AND SEEN/UNSEEN */}
      {userExist ? (
        <div className="flex justify-center gap-8 items-center">
          {/* //-SEEN/UNSEEN */}
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
          {/* //-PENDING/NO PENDING */}
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
