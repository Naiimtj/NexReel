import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const ButtonIsFollowing = ({
  isFollowing = false,
  handleFollow = () => {},
  handleUnFollow = () => {},
}) => {
  const [t] = useTranslation('translation');

  if (isFollowing) {
    return (
      <button
        className="text-sm cursor-pointer transition duration-300 border px-1 rounded-md border-purpleNR text-purpleNR hover:border-gray-500 hover:text-gray-500"
        onClick={handleFollow}
      >
        {t('Follow')}
      </button>
    );
  }

  return (
    <button
      className="text-sm cursor-pointer transition duration-300 text-gray-500 border px-1 rounded-md border-gray-500 hover:border-purpleNR hover:text-purpleNR"
      onClick={handleUnFollow}
    >
      {t('No Follow')}
    </button>
  );
};

ButtonIsFollowing.propTypes = {
  isFollowing: PropTypes.bool,
  handleFollow: PropTypes.func,
  handleUnFollow: PropTypes.func,
};

export default ButtonIsFollowing;
