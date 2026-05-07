import PropTypes from 'prop-types';
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

EyeSlashFillIcon.propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string,
  className: PropTypes.string,
};

export default EyeSlashFillIcon;
