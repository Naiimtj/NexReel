import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

const navBase =
  'text-xs md:text-base lg:text-xl hover:text-gray-300 transition duration-300';

const variantClasses = {
  nav: null,
  primary:
    'text-purpleNR hover:text-gray-400 transition ease-in-out duration-300 cursor-pointer',
  default: '',
};

const BaseLink = ({
  to,
  variant = 'default',
  children,
  className = '',
  ...props
}) => {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  let classes;
  if (variant === 'nav') {
    const activeClass = isActive ? 'text-purpleNR font-bold' : 'text-grayNR';
    classes = `${activeClass} ${navBase} ${className}`.trim();
  } else {
    classes = `${variantClasses[variant] ?? ''} ${className}`.trim();
  }

  return (
    <Link to={to} className={classes} {...props}>
      {children}
    </Link>
  );
};

BaseLink.propTypes = {
  to: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['nav', 'primary', 'default']),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default BaseLink;
