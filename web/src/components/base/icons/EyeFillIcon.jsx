import PropTypes from 'prop-types';
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

EyeFillIcon.propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string,
  className: PropTypes.string,
};

export default EyeFillIcon;
