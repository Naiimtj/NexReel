import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { NoImage } from "../assets/image";

export const Credits = ({ repInfo, media, idInfo }) => {
  const navegate = useNavigate();
  const {
    profile_path,
    name,
    known_for_department,
    character,
    id,
    roles,
    username,
    avatarURL,
  } = repInfo;
  const urlPerson =
    profile_path !== undefined
      ? `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${profile_path}`
      : null;

  const processInfo = {};
  switch (media) {
    case "movie":
      processInfo.repFoto = profile_path !== null ? urlPerson : NoImage;
      processInfo.repNombre = name;
      processInfo.repPersonaje = character;
      processInfo.repFuncion = known_for_department;
      processInfo.urlNavegation = `/${media}/${idInfo}/person/${id}`;
      break;
    case "tv":
      processInfo.repFoto = profile_path !== null ? urlPerson : NoImage;
      processInfo.repNombre = name;
      processInfo.repPersonaje =
        roles && roles.length > 0 ? roles[0].character : null;
      processInfo.repFuncion = known_for_department;
      processInfo.urlNavegation = `/${media}/${idInfo}/person/${id}`;
      break;
    case "person":
      processInfo.repFoto = profile_path !== null ? urlPerson : NoImage;
      processInfo.repNombre = name;
      processInfo.repPersonaje = known_for_department;
      processInfo.urlNavegation = `/person/${id}`;
      break;
    case "user":
      processInfo.repFoto = avatarURL !== null ? avatarURL : NoImage;
      processInfo.repNombre = username;
      processInfo.repPersonaje = "User";
      processInfo.urlNavegation = `/users/${id}`;
      break;
    default:
      break;
  }

  return (
    <div className="slide flex flex-col justify-start content-center items-center">
      <div>
        <img
          className={`cursor-pointer rounded-full object-cover ${
            media === "person" || media === "user" ? "h-28 w-28" : "h-40 w-40"
          } transition ease-in-out md:hover:scale-105 duration-300`}
          src={processInfo.repFoto}
          alt={processInfo.repNombre}
          onClick={() => navegate(processInfo.urlNavegation)}
        />
      </div>
      <div
        className=" cursor-pointer text-center mt-4 w-full"
        onClick={() => navegate(processInfo.urlNavegation)}
      >
        <h2
          className={`font-semibold ${
            media === "person" || media === "user" ? "text-sm" : "text-base"
          } break-words`}
        >
          {processInfo.repNombre}
        </h2>
        <p className="text-sm text-gray-400 break-words">
          {processInfo.repPersonaje}
        </p>
      </div>
    </div>
  );
};

export default Credits;

Credits.defaultProps = {
  idInfo: 0,
  repInfo: {},
  media: "",
};

Credits.propTypes = {
  idInfo: PropTypes.number,
  repInfo: PropTypes.object,
  media: PropTypes.string,
};
