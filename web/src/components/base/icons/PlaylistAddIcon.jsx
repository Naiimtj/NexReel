import PropTypes from 'prop-types';
import { MdOutlinePlaylistAdd } from 'react-icons/md';
import { getIconSize } from '../../../utils/sizeIcon';

const PlaylistAddIcon = ({
  size = 'md',
  color = 'currentColor',
  className = '',
  ...props
}) => (
  <MdOutlinePlaylistAdd
    size={getIconSize(size)}
    color={color}
    className={className}
    {...props}
  />
);

PlaylistAddIcon.propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string,
  className: PropTypes.string,
};

export default PlaylistAddIcon;
