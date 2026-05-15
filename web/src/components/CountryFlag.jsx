import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useCountryName } from './CountryName';

const codeToFlagEmoji = (code) => {
  if (!code || typeof code !== 'string' || code.length !== 2) return '';
  const upper = code.toUpperCase();
  return String.fromCodePoint(
    127397 + upper.codePointAt(0),
    127397 + upper.codePointAt(1),
  );
};

function CountryFlag({ code, className = '' }) {
  const getName = useCountryName();
  const name = getName(code);
  const flag = codeToFlagEmoji(code);
  const wrapperRef = useRef(null);
  const [coords, setCoords] = useState(null);

  if (!flag) return null;

  const showTooltip = () => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    setCoords({
      top: rect.top - 10,
      left: rect.left + rect.width / 2,
    });
  };
  const hideTooltip = () => setCoords(null);
  const label = name || code;

  return (
    <>
      <span
        ref={wrapperRef}
        className={`inline-block cursor-default ${className}`.trim()}
        aria-label={label}
        role="img"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {flag}
      </span>
      {coords &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="tooltip"
            className="fixed z-[1000] px-2 py-1 text-xs text-white dark:text-black bg-gray-900 dark:bg-gray-300 rounded-md shadow-lg whitespace-nowrap pointer-events-none"
            style={{
              top: coords.top,
              left: coords.left,
              transform: 'translate(-100%, -50%)',
            }}
          >
            {label}
          </div>,
          document.body,
        )}
    </>
  );
}
export default CountryFlag;
