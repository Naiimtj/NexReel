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
export default UserPlusIcon;
