import PropTypes from 'prop-types';
import { FaUserTimes } from 'react-icons/fa';
import { getIconSize } from '../../../utils/sizeIcon';

const UserTimesIcon = ({
  size = 'md',
  color = 'currentColor',
  className = '',
  ...props
}) => (
  <FaUserTimes
    size={getIconSize(size)}
    color={color}
    className={className}
    {...props}
  />
);

UserTimesIcon.propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string,
  className: PropTypes.string,
};

export default UserTimesIcon;
