import PropTypes from 'prop-types';
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

LockPasswordIcon.propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string,
  className: PropTypes.string,
};

export default LockPasswordIcon;
