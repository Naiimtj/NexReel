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
export default UserAltSlashIcon;
