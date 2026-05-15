
const hoverClasses = {
  scale:
    'cursor-pointer transition ease-in-out md:hover:scale-110 duration-300',
  color:
    'cursor-pointer transition ease-in-out text-[#6676a7] md:hover:scale-110 md:hover:text-gray-200 duration-300',
};

const BaseIconButton = ({
  hover = 'scale',
  onClick,
  children,
  className = '',
  ...props
}) => {
  const base = hoverClasses[hover] ?? hoverClasses.scale;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
};
export default BaseIconButton;
