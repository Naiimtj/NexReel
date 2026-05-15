import { getIconSize } from '../../../utils/sizeIcon';

const DotFillIcon = ({
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
      <path d="M8 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" />
    </svg>
  );
};
export default DotFillIcon;
