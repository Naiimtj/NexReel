import PropTypes from 'prop-types';
import { getIconSize } from '../../../utils/sizeIcon';
import RepeatSeenActive from '../../Icons/RepeatSeenActive';

const RepeatSeenActiveIcon = ({
  size = 'md',
  color = 'currentColor',
  className = '',
  ...props
}) => {
  const iconSize = getIconSize(size);
  return (
    <RepeatSeenActive
      width={iconSize}
      height={iconSize}
      fill={color}
      className={className}
      {...props}
    />
  );
};

RepeatSeenActiveIcon.propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string,
  className: PropTypes.string,
};

export default RepeatSeenActiveIcon;
