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
export default PlaylistAddIcon;
