import { BsFillEyeSlashFill } from 'react-icons/bs';
import { getIconSize } from '../../../utils/sizeIcon';

const EyeSlashFillIcon = ({
  size = 'md',
  color = 'currentColor',
  className = '',
  ...props
}) => (
  <BsFillEyeSlashFill
    size={getIconSize(size)}
    color={color}
    className={className}
    {...props}
  />
);
export default EyeSlashFillIcon;
