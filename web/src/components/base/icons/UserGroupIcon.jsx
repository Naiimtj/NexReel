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
export default UserGroupIcon;
