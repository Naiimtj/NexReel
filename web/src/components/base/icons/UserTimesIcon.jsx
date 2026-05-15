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
export default UserTimesIcon;
