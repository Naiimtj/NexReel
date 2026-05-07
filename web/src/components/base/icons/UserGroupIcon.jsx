import PropTypes from 'prop-types';
import { HiUserGroup } from 'react-icons/hi';
import { getIconSize } from '../../../utils/sizeIcon';

const UserGroupIcon = ({
  size = 'md',
  color = 'currentColor',
  className = '',
  ...props
}) => (
  <HiUserGroup
    size={getIconSize(size)}
    color={color}
    className={className}
    {...props}
  />
);

UserGroupIcon.propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string,
  className: PropTypes.string,
};

export default UserGroupIcon;
