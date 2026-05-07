import PropTypes from 'prop-types';
import { FaUserPlus } from 'react-icons/fa';
import { getIconSize } from '../../../utils/sizeIcon';

const UserPlusIcon = ({
  size = 'md',
  color = 'currentColor',
  className = '',
  ...props
}) => (
  <FaUserPlus
    size={getIconSize(size)}
    color={color}
    className={className}
    {...props}
  />
);

UserPlusIcon.propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string,
  className: PropTypes.string,
};

export default UserPlusIcon;
