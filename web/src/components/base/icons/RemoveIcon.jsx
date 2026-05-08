import PropTypes from 'prop-types';
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

RemoveIcon.propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string,
  className: PropTypes.string,
};

export default RemoveIcon;
