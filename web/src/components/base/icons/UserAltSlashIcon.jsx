import PropTypes from 'prop-types';
import { FaUserAltSlash } from 'react-icons/fa';
import { getIconSize } from '../../../utils/sizeIcon';

const UserAltSlashIcon = ({
  size = 'md',
  color = 'currentColor',
  className = '',
  ...props
}) => (
  <FaUserAltSlash
    size={getIconSize(size)}
    color={color}
    className={className}
    {...props}
  />
);

UserAltSlashIcon.propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string,
  className: PropTypes.string,
};

export default UserAltSlashIcon;
