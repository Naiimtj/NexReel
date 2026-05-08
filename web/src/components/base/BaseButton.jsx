import PropTypes from 'prop-types';

const variantClasses = {
  primary:
    'cursor-pointer text-purpleNR md:hover:text-gray-400 transition duration-300',
  danger:
    'cursor-pointer text-red-500 md:hover:text-gray-400 transition duration-200',
  outline:
    'cursor-pointer border rounded-md border-purpleNR text-purpleNR hover:border-gray-500 md:hover:text-gray-400 transition duration-300',
  icon: 'cursor-pointer transition ease-in-out md:hover:scale-110 duration-300',
  menu: 'hover:bg-gray-100 text-sm text-gray-700 cursor-pointer w-full text-left',
  text: 'cursor-pointer text-purpleNR md:hover:text-gray-400 transition duration-300',
};

const sizeClasses = {
  small: 'px-3 py-2 md:text-sm text-xs',
  medium: 'px-6 py-3 md:text-lg text-sm font-semibold',
  large: 'px-8 py-4 md:text-xl text-lg font-semibold',
};

const iconSizeClasses = {
  small: 'p-1.5 text-base',
  medium: 'p-2 text-lg',
  large: 'p-3 text-xl',
};

const menuSizeClasses = {
  small: 'px-4 py-2 text-sm',
  medium: 'px-5 py-3 text-base',
  large: 'px-6 py-4 text-lg',
};

const getSizeClass = (variant, size) => {
  if (variant === 'icon')
    return iconSizeClasses[size] ?? iconSizeClasses.medium;
  if (variant === 'menu')
    return menuSizeClasses[size] ?? menuSizeClasses.medium;
  return sizeClasses[size] ?? sizeClasses.medium;
};

const hasPaddingOverride = (className) =>
  /(^|\s)(p-|px-|py-|pt-|pb-|pl-|pr-)/.test(className);

const BaseButton = ({
  variant = 'primary',
  size = 'medium',
  type = 'button',
  onClick,
  disabled = false,
  children,
  className = '',
  ...props
}) => {
  const base = variantClasses[variant] ?? variantClasses.primary;
  const sizeClass = hasPaddingOverride(className)
    ? ''
    : getSizeClass(variant, size);
  const disabledClass = disabled ? 'opacity-50 !cursor-not-allowed' : '';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${sizeClass} ${disabledClass} ${className}`
        .trim()
        .replaceAll(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </button>
  );
};

BaseButton.propTypes = {
  variant: PropTypes.oneOf([
    'primary',
    'danger',
    'outline',
    'icon',
    'menu',
    'text',
  ]),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default BaseButton;
