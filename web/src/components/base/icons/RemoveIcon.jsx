import { IoIosRemove } from 'react-icons/io';
import { getIconSize } from '../../../utils/sizeIcon';

const RemoveIcon = ({
  size = 'md',
  color = 'currentColor',
  className = '',
  ...props
}) => (
  <IoIosRemove
    size={getIconSize(size)}
    color={color}
    className={className}
    {...props}
  />
);
export default RemoveIcon;
