import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { NoImage, movie, people, tv } from "../../assets/image";
import { BsAlarm, BsAlarmFill } from "react-icons/bs";
import {
  IoCheckmarkCircleOutline,
  IoCheckmarkCircleSharp,
} from "react-icons/io5";

export const MultiSmall = ({
  info,
  mediaMovie,
  mediaTv,
  seenMedia,
  pendingMedia,
  handleSeenMedia,
  handlePending,
}) => {
  const [t] = useTranslation("translation");
  const {
    title,
    name,
    media_type,
    poster_path,
    release_date,
    first_air_date,
    known_for_department,
    profile_path,
    id,
  } = info;
  // Poster
  const url =
    (poster_path && poster_path !== undefined) ||
    (profile_path && profile_path !== null)
      ? `https://www.themoviedb.org/t/p/w300_and_h450_bestv2${poster_path}`
      : null;
  const BgPosterInfo = url || NoImage;

  const processInfo = {
    bgPoster: BgPosterInfo,
    title: title || name,
    date: release_date
      ? new Date(release_date).getFullYear()
      : first_air_date
      ? new Date(first_air_date).getFullYear()
      : known_for_department,
    type: media_type,
  };

  if (mediaMovie) {
    processInfo.type = "movie";
  } else if (mediaTv) {
    processInfo.type = "tv";
  }

  return (
    <div
      className="static cursor-pointer text-gray-200 rounded-xl bg-cover w-full"
      // style={{
      //   backgroundImage: `url(${processInfo.bgPoster})`,
      // }}
    >
      <div className="static bg-local backdrop-blur-md bg-[#20283E]/80 p-1 rounded-xl h-full grid grid-cols-3 ">
        <Link
          to={`/${mediaMovie ? "movie" : mediaTv ? "tv" : media_type}/${id}`}
          target="_blank"
        >
          <div className="relative">
            {/* //-POSTER*/}
            <div className="transition ease-in-out md:hover:scale-105 duration-300 pb-3">
              {url ? (
                <img
                  className="static aspect-auto cursor-pointer rounded-lg"
                  src={processInfo.bgPoster}
                  alt={processInfo.title}
                />
              ) : (
                <div className="relative flex justify-center items-center">
                  <img
                    className="absolute h-24 opacity-10"
                    src={
                      processInfo.type === "movie"
                        ? movie
                        : processInfo.type === "tv"
                        ? tv
                        : processInfo.type === "person"
                        ? people
                        : null
                    }
                    alt={t("Icon people")}
                  />
                  <img
                    className="static aspect-auto cursor-pointer rounded-lg"
                    src={processInfo.bgPoster}
                    alt={t("No photo")}
                  />
                </div>
              )}
            </div>
          </div>
        </Link>
        {/* //.ICONS AND TITLE */}
        <div className="col-span-2 mt-2 pl-2 flex flex-col justify-between">
          {/* //-ICON BY TYPE & YEAR */}
          <Link
            to={`/${mediaMovie ? "movie" : mediaTv ? "tv" : media_type}/${id}`}
            target="_blank"
          >
            <div className="mb-2 grid grid-cols-2 gap-4 ">
              <div className="text-xs align-middle">
                {processInfo.type !== "No media_type" ? (
                  <img
                    className="w-4"
                    src={
                      processInfo.type === "movie"
                        ? movie
                        : processInfo.type === "tv"
                        ? tv
                        : processInfo.type === "person"
                        ? people
                        : null
                    }
                  />
                ) : media_type === "movie" ? (
                  <img className="w-4" src={movie} />
                ) : media_type === "tv" ? (
                  <img className="w-4" src={tv} />
                ) : media_type === "person" ? (
                  <img className="w-4" src={people} />
                ) : null}
              </div>
              {/* <div className="text-right align-middle text-xs">
                {processInfo.date !== null ? processInfo.date : null}
              </div> */}
            </div>
            {/* //-TITLE */}
            <div className="font-semibold text-sm cursor-pointer">
              <p className="line-clamp-3">{processInfo.title}</p>
            </div>
          </Link>

          <div className="grid grid-cols-2 justify-between items-center justify-items-center">
            {/* //-SEEN/UNSEEN */}
            <div className="">
              {media_type !== "person" ? (
                seenMedia !== true ? (
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
                )
              ) : null}
            </div>
            {/* //-PENDING/NO PENDING */}
            <div className="">
              {pendingMedia !== true ? (
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
        </div>
      </div>
    </div>
  );
};

export default MultiSmall;

MultiSmall.defaultProps = {
  info: {},
  mediaMovie: false,
  mediaTv: false,
  seenMedia: false,
  pendingMedia: false,
  handleSeenMedia: () => {},
  handlePending: () => {},
};

MultiSmall.propTypes = {
  info: PropTypes.object,
  mediaMovie: PropTypes.bool,
  mediaTv: PropTypes.bool,
  seenMedia: PropTypes.bool,
  pendingMedia: PropTypes.bool,
  handleSeenMedia: PropTypes.func,
  handlePending: PropTypes.func,
};
