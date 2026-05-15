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
export default PlaylistRemoveIcon;
