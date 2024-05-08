import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { BsAlarm, BsAlarmFill } from "react-icons/bs";
import {
  IoCheckmarkCircleOutline,
  IoCheckmarkCircleSharp,
} from "react-icons/io5";

const SeenPendingButton = ({ condition, size, text, handle }) => {
  const [t] = useTranslation("translation");
  let iconActive;
  let iconNoActive;
  switch (text) {
    case "Pending":
      iconActive = (
        <BsAlarm
          className="inline-block"
          size={size}
          color="#FFCA28"
          alt={t(`${text}`)}
          onClick={handle}
        />
      );
      iconNoActive = (
        <BsAlarmFill
          className="inline-block"
          size={size}
          color="#FFCA28"
          alt={t(`No ${text}`)}
          onClick={handle}
        />
      );
      break;
    case "Seen":
      iconActive = (
        <IoCheckmarkCircleOutline
          className="inline-block"
          size={size}
          color="#FFCA28"
          alt={`${text}`}
          onClick={handle}
        />
      );
      iconNoActive = (
        <IoCheckmarkCircleSharp
          className="inline-block"
          size={size}
          color="#FFCA28"
          alt={t(`No ${text}`)}
          onClick={handle}
        />
      );
      break;

    default:
      break;
  }
  return (
    <>
      {condition !== true ? (
        <button className="cursor-pointer transition ease-in-out md:hover:scale-110 duration-300">
          {iconActive}
        </button>
      ) : (
        <button className="cursor-pointer transition ease-in-out md:hover:scale-110 duration-300">
          {iconNoActive}
        </button>
      )}
    </>
  );
};

export default SeenPendingButton;

SeenPendingButton.defaultProps = {
  condition: false,
  size: 0,
  text: "",
  handle: () => {},
};

SeenPendingButton.propTypes = {
  condition: PropTypes.bool,
  size: PropTypes.number,
  text: PropTypes.string,
  handle: PropTypes.func,
};
