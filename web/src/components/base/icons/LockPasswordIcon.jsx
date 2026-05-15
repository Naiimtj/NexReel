import { RiLockPasswordFill } from 'react-icons/ri';
import { getIconSize } from '../../../utils/sizeIcon';

const LockPasswordIcon = ({
  size = 'md',
  color = 'currentColor',
  className = '',
  ...props
}) => (
  <RiLockPasswordFill
    size={getIconSize(size)}
    color={color}
    className={className}
    {...props}
  />
);
export default LockPasswordIcon;
