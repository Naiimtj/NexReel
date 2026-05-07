import PropTypes from 'prop-types';
import { FaUserClock } from 'react-icons/fa';
import { getIconSize } from '../../../utils/sizeIcon';

const UserClockIcon = ({
  size = 'md',
  color = 'currentColor',
  className = '',
  ...props
}) => (
  <FaUserClock
    size={getIconSize(size)}
    color={color}
    className={className}
    {...props}
  />
);

UserClockIcon.propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string,
  className: PropTypes.string,
};

export default UserClockIcon;
