import PropTypes from 'prop-types';
import { BaseIcon } from '../../components/base';

const NavArrowButton = ({
  direction = 'back',
  label = '',
  onClick,
  hidden = false,
  className = '',
}) => {
  if (hidden) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-row items-center gap-1 text-[#b1a9fa] md:hover:text-gray-500 transition duration-200 cursor-pointer ${className}`
        .trim()
        .replaceAll(/\s+/g, ' ')}
    >
      {direction === 'back' && <BaseIcon icon="arrowLeft" size="small" />}
      <span>{label}</span>
      {direction === 'forward' && <BaseIcon icon="arrowRight" size="small" />}
    </button>
  );
};

NavArrowButton.propTypes = {
  direction: PropTypes.oneOf(['back', 'forward']),
  label: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  hidden: PropTypes.bool,
  className: PropTypes.string,
};

export default NavArrowButton;
