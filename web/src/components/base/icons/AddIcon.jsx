import PropTypes from 'prop-types';
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

AddIcon.propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string,
  className: PropTypes.string,
};

export default AddIcon;
