import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useCountryName } from './CountryName';

const normalizeCountryCode = (code) => {
  if (!code || typeof code !== 'string') return '';
  const normalized = code.trim().toUpperCase();
  return normalized.length === 2 ? normalized : '';
};

function CountryFlag({ code, className = '' }) {
  const getName = useCountryName();
  const normalizedCode = normalizeCountryCode(code);
  const name = getName(normalizedCode);
  const wrapperRef = useRef(null);
  const [coords, setCoords] = useState(null);
  const [imageFailed, setImageFailed] = useState(false);

  if (!normalizedCode) return null;

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
        className={`inline-flex h-5 min-w-7 items-center justify-center cursor-default ${className}`.trim()}
        aria-label={label}
        role="img"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {!imageFailed ? (
          <img
            src={`https://flagcdn.com/w40/${normalizedCode.toLowerCase()}.png`}
            alt=""
            className="h-4 w-6 object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="text-[0.65rem] font-semibold leading-none">
            {normalizedCode}
          </span>
        )}
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
