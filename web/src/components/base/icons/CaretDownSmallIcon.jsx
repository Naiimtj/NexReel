import { getIconSize } from '../../../utils/sizeIcon';

const CaretDownSmallIcon = ({
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
      viewBox="0 0 24 24"
      fill={color}
      className={className}
      {...props}
    >
      <path d="M7 10l5 5 5-5z" />
    </svg>
  );
};
export default CaretDownSmallIcon;
