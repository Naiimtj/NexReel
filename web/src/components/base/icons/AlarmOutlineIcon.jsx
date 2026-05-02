import PropTypes from 'prop-types';
import { getIconSize } from '../../../utils/sizeIcon';

const AlarmOutlineIcon = ({
  size = 'md',
  color = 'currentColor',
  className = '',
  ...props
}) => {
  const iconSize = getIconSize(size);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={iconSize}
      height={iconSize}
      viewBox="0 0 16 16"
      fill={color}
      className={className}
      {...props}
    >
      <path d="M8 15A6 6 0 1 0 8 3a6 6 0 0 0 0 12zm0 1A7 7 0 1 1 8 2a7 7 0 0 1 0 14z" />
      <path d="M8 4.5a.5.5 0 0 1 .5.5v4.4l2.7 1.6a.5.5 0 1 1-.5.86l-3-1.8A.5.5 0 0 1 7.5 9.5V5a.5.5 0 0 1 .5-.5z" />
      <path d="M.86 5.387A2.5 2.5 0 1 1 4.387 1.86L.86 5.387zm14.28 0L11.613 1.86a2.5 2.5 0 1 1 3.527 3.527zM11.71 15.293l.882.453.78-.36-.572-.79-.967-.5-.123 1.197zM4.29 15.293l-.123-1.197-.967.5-.572.79.78.36.882-.453z" />
    </svg>
  );
};

AlarmOutlineIcon.propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string,
  className: PropTypes.string,
};

export default AlarmOutlineIcon;
