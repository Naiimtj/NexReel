import PropTypes from 'prop-types';
import BaseLabel from './BaseLabel';
import { AlertIcon } from './icons';

const BaseTextarea = ({
  label,
  value = '',
  placeholder,
  tooltip,
  mandatory = false,
  disabled = false,
  rows = 4,
  errorMessages = [],
  onChange,
  onBlur,
  className = '',
  id,
  ...props
}) => {
  const hasError = Array.isArray(errorMessages) && errorMessages.length > 0;

  const handleChange = (e) => {
    if (onChange) onChange(e.target.value, e);
  };

  let stateClass = 'bg-white border-gray-300 focus:border-purpleNR';
  if (disabled)
    stateClass = 'bg-gray-50 border-gray-300 cursor-not-allowed opacity-60';
  if (hasError) stateClass = 'bg-white border-red-500 focus:border-red-500';

  return (
    <div className={`flex flex-col w-full gap-2 ${className}`.trim()}>
      {label && (
        <BaseLabel
          label={label}
          tooltip={tooltip}
          mandatory={mandatory}
          htmlFor={id}
          className="text-base font-semibold"
        />
      )}

      <textarea
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        rows={rows}
        className={`w-full px-3 py-2 border rounded-md outline-none transition-colors resize-none ${stateClass}`}
        {...props}
      />

      {hasError && (
        <div className="flex items-center gap-1 text-red-500 text-sm">
          <AlertIcon size="x-small" />
          <span>{errorMessages[0]}</span>
        </div>
      )}
    </div>
  );
};

BaseTextarea.propTypes = {
  label: PropTypes.node,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  tooltip: PropTypes.string,
  mandatory: PropTypes.bool,
  disabled: PropTypes.bool,
  rows: PropTypes.number,
  errorMessages: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  className: PropTypes.string,
  id: PropTypes.string,
};

export default BaseTextarea;
