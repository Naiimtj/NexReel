import PropTypes from 'prop-types';
import { MdOutlinePlaylistRemove } from 'react-icons/md';
import { getIconSize } from '../../../utils/sizeIcon';

const PlaylistRemoveIcon = ({
  size = 'md',
  color = 'currentColor',
  className = '',
  ...props
}) => (
  <MdOutlinePlaylistRemove
    size={getIconSize(size)}
    color={color}
    className={className}
    {...props}
  />
);

PlaylistRemoveIcon.propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string,
  className: PropTypes.string,
};

export default PlaylistRemoveIcon;
