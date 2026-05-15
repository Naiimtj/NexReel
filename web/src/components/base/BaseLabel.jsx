import { useState } from 'react';

const BaseLabel = ({
  label,
  tooltip,
  mandatory = false,
  htmlFor,
  className = '',
  ...props
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!label) return null;

  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium text-gray-700 ${className}`.trim()}
      {...props}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {mandatory && <span className="text-red-500">*</span>}
        {tooltip && (
          <div className="relative inline-block">
            <button
              type="button"
              aria-label="info"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onFocus={() => setShowTooltip(true)}
              onBlur={() => setShowTooltip(false)}
              className="w-4 h-4 rounded-full border border-gray-400 text-gray-500 text-[10px] leading-none flex items-center justify-center cursor-help"
            >
              ?
            </button>
            {showTooltip && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50 pointer-events-none">
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>
    </label>
  );
};
export default BaseLabel;
