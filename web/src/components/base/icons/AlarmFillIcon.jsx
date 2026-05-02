import PropTypes from 'prop-types';
import { getIconSize } from '../../../utils/sizeIcon';

const AlarmFillIcon = ({
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
      <path d="M6.5 0a.5.5 0 0 0 0 1H7v1.07A7.001 7.001 0 0 0 2.276 4.187l-.762-.762a.5.5 0 0 0-.707.708l.767.767A6.97 6.97 0 0 0 1 9c0 1.547.5 2.978 1.348 4.143l-.495.495a.5.5 0 1 0 .707.707l.452-.452A7 7 0 0 0 13.988 13.9l.452.453a.5.5 0 0 0 .707-.707l-.495-.495A6.97 6.97 0 0 0 15 9a6.97 6.97 0 0 0-1.574-4.1l.767-.767a.5.5 0 0 0-.708-.708l-.762.762A7.001 7.001 0 0 0 9 2.07V1h.5a.5.5 0 0 0 0-1h-3zm2 5.6V9a.5.5 0 0 1-.5.5H4.5a.5.5 0 0 1 0-1h3V5.6a.5.5 0 0 1 1 0z" />
    </svg>
  );
};

AlarmFillIcon.propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string,
  className: PropTypes.string,
};

export default AlarmFillIcon;
