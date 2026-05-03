import PropTypes from 'prop-types';
import { getIconSize } from '../../../utils/sizeIcon';
import RepeatSeenNoActive from '../../Icons/RepeatSeenNoActive';

const RepeatSeenInactiveIcon = ({
  size = 'md',
  color = 'currentColor',
  className = '',
  ...props
}) => {
  const iconSize = getIconSize(size);
  return (
    <RepeatSeenNoActive
      width={iconSize}
      height={iconSize}
      fill={color}
      className={className}
      {...props}
    />
  );
};

RepeatSeenInactiveIcon.propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string,
  className: PropTypes.string,
};

export default RepeatSeenInactiveIcon;
