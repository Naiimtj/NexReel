import PropTypes from 'prop-types';
import { getIconSize } from '../../../utils/sizeIcon';

const DotIcon = ({
  size = 'md',
  color = 'currentColor',
  className = '',
  ...props
}) => {
  const iconSize = getIconSize(size);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={iconSize}
      height={iconSize}
      viewBox="0 0 16 16"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      className={className}
      {...props}
    >
      <circle cx="8" cy="8" r="3.25" />
    </svg>
  );
};

DotIcon.propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string,
  className: PropTypes.string,
};

export default DotIcon;
