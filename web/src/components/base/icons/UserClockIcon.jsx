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
export default UserClockIcon;
