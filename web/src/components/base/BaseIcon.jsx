import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { iconRegistry } from './icons';

const TooltipWrapper = ({
  children,
  tooltip,
  position,
  absoluteMode = false,
  showDelay = 100,
  hideDelay = 0,
  wrapperClassName = 'inline-block',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTimeout, setShowTimeout] = useState(null);
  const [hideTimeout, setHideTimeout] = useState(null);
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const wrapperRef = useRef(null);

  const updatePosition = () => {
    if (wrapperRef.current) {
      const target = absoluteMode
        ? wrapperRef.current.firstElementChild || wrapperRef.current
        : wrapperRef.current;
      const rect = target.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (showTimeout) clearTimeout(showTimeout);
      if (hideTimeout) clearTimeout(hideTimeout);
    };
  }, [showTimeout, hideTimeout]);

  const isTouchDevice = globalThis.window?.matchMedia('(hover: none)').matches ?? false;

  if (!tooltip || isTouchDevice) {
    return <div className={wrapperClassName}>{children}</div>;
  }

  const handleMouseEnter = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }

    updatePosition();
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, showDelay);
    setShowTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (showTimeout) {
      clearTimeout(showTimeout);
      setShowTimeout(null);
    }

    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, hideDelay);
    setHideTimeout(timeout);
  };

  const getTooltipPosition = () => {
    const gap = 8;
    const positions = {
      top: {
        top: coords.top - gap,
        left: coords.left + coords.width / 2,
        transform: 'translate(-50%, -100%)',
      },
      bottom: {
        top: coords.top + coords.height + gap,
        left: coords.left + coords.width / 2,
        transform: 'translateX(-50%)',
      },
      down: {
        top: coords.top + coords.height + gap,
        left: coords.left + coords.width / 2,
        transform: 'translateX(-50%)',
      },
      left: {
        top: coords.top + coords.height / 2,
        left: coords.left - gap,
        transform: 'translate(-100%, -50%)',
      },
      right: {
        top: coords.top + coords.height / 2,
        left: coords.left + coords.width + gap,
        transform: 'translateY(-50%)',
      },
      topleft: {
        top: coords.top - gap,
        left: coords.left + coords.width,
        transform: 'translate(-100%, -100%)',
      },
      topright: {
        top: coords.top - gap,
        left: coords.left,
        transform: 'translateY(-100%)',
      },
      downleft: {
        top: coords.top + coords.height + gap,
        left: coords.left + coords.width,
        transform: 'translateX(-100%)',
      },
      downright: {
        top: coords.top + coords.height + gap,
        left: coords.left,
        transform: 'none',
      },
    };
    return positions[position] || positions.top;
  };

  const tooltipStyle = isVisible ? getTooltipPosition() : {};

  return (
    <>
      <div className={wrapperClassName}>
        <div
          ref={wrapperRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="inline-block"
        >
          {children}
        </div>
      </div>
      {isVisible &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="tooltip"
            className=" hidden md:block fixed z-[1000] p-1 text-sm text-white dark:text-black bg-gray-900 dark:bg-gray-300 rounded-md shadow-lg whitespace-nowrap pointer-events-none"
            style={tooltipStyle}
          >
            {tooltip}
          </div>,
          document.body,
        )}
    </>
  );
};
const BaseIcon = ({
  icon,
  size = 'md',
  color = 'currentColor',
  className = '',
  onClick,
  isClicked = false,
  tooltip,
  tooltipPosition = 'top',
  tooltipShowDelay = 100,
  tooltipHideDelay = 0,
  absoluteMode = false,
  wrapperClassName = 'inline-block',
  ...props
}) => {
  const IconComponent = iconRegistry[icon];
  const cursorClass = isClicked || onClick ? 'cursor-pointer' : '';
  const composedClass = `${className} ${cursorClass}`.trim();

  if (!IconComponent) {
    return null;
  }

  const iconElement = (
    <IconComponent
      size={size}
      color={color}
      className={composedClass}
      onClick={onClick}
      {...props}
    />
  );

  return (
    <TooltipWrapper
      tooltip={tooltip}
      position={tooltipPosition}
      absoluteMode={absoluteMode}
      showDelay={tooltipShowDelay}
      hideDelay={tooltipHideDelay}
      wrapperClassName={wrapperClassName}
    >
      {iconElement}
    </TooltipWrapper>
  );
};
export default BaseIcon;
