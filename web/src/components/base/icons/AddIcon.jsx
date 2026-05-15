import { IoMdAdd } from 'react-icons/io';
import { getIconSize } from '../../../utils/sizeIcon';

const AddIcon = ({
  size = 'md',
  color = 'currentColor',
  className = '',
  ...props
}) => (
  <IoMdAdd
    size={getIconSize(size)}
    color={color}
    className={className}
    {...props}
  />
);
export default AddIcon;
