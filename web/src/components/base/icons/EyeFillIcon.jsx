import { BsFillEyeFill } from 'react-icons/bs';
import { getIconSize } from '../../../utils/sizeIcon';

const EyeFillIcon = ({
  size = 'md',
  color = 'currentColor',
  className = '',
  ...props
}) => (
  <BsFillEyeFill
    size={getIconSize(size)}
    color={color}
    className={className}
    {...props}
  />
);
export default EyeFillIcon;
