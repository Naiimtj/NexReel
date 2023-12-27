import { useTranslation } from 'react-i18next';
import PropTypes from "prop-types";

const ButtonIsFollowing = ({isFollowing, handleFollow, handleUnFollow}) => {
  const [t] = useTranslation("translation");

  return (
    <>
    {isFollowing ? (
      <button
        className="cursor-pointer transition duration-300 border px-1 rounded-md border-purpleNR text-purpleNR hover:border-gray-500 hover:text-gray-500"
        onClick={handleFollow}
      >
        {t("Follow")}
      </button>
    ) : (
      <button
        className="cursor-pointer transition duration-300 text-gray-500 border px-1 rounded-md border-gray-500 hover:border-purpleNR hover:text-purpleNR"
        onClick={handleUnFollow}
      >
        {t("No Follow")}
      </button>
    )}
    </>
  )
}

export default ButtonIsFollowing
ButtonIsFollowing.defaultProps = {
    isFollowing: false,
    handleFollow: () => {},
    handleUnFollow: () => {},
  };
  
  ButtonIsFollowing.propTypes = {
    isFollowing: PropTypes.bool,
    handleFollow: PropTypes.func,
    handleUnFollow: PropTypes.func,
  };