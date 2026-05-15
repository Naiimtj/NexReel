import { useId } from 'react';

const SIZE_CLASSES = {
  small: 'w-4 h-4',
  medium: 'w-5 h-5',
  large: 'w-6 h-6',
};

const COLOR_CLASSES = {
  primary: 'accent-purpleNR text-purpleNR focus:ring-purpleNR',
  secondary: 'accent-gray-600 text-gray-600 focus:ring-gray-500',
  danger: 'accent-red-600 text-red-600 focus:ring-red-500',
  success: 'accent-green-600 text-green-600 focus:ring-green-500',
  warning: 'accent-yellow-500 text-yellow-500 focus:ring-yellow-500',
  info: 'accent-cyan-600 text-cyan-600 focus:ring-cyan-500',
};

const BaseCheckbox = ({
  label,
  value = false,
  checked,
  id,
  labelPosition = 'right',
  disabled = false,
  onChange,
  children,
  color = 'primary',
  size = 'medium',
  className = '',
  labelClassName = '',
  ...rest
}) => {
  const autoId = useId();
  const inputId = id ? String(id) : autoId;
  const isChecked = checked === undefined ? value : checked;

  const handleChange = (event) => {
    const newChecked = event.target.checked;
    if (onChange) onChange(newChecked, { value: newChecked, id, event });
  };

  const checkboxClasses = `
    ${SIZE_CLASSES[size] || SIZE_CLASSES.medium}
    ${COLOR_CLASSES[color] || COLOR_CLASSES.primary}
    ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
  `.trim();

  if (!label) {
    return (
      <div className={`flex items-center ${className}`.trim()}>
        <input
          type="checkbox"
          id={inputId}
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
          className={checkboxClasses}
          {...rest}
        />
        {children}
      </div>
    );
  }

  const placeStart = labelPosition === 'left';
  const flexOrder = placeStart ? 'flex-row-reverse' : 'flex-row';
  const cursorClass = disabled
    ? 'cursor-not-allowed opacity-50'
    : 'cursor-pointer';

  return (
    <div className={`flex items-center ${className}`.trim()}>
      <label
        htmlFor={inputId}
        className={`flex items-center gap-2 ${flexOrder} ${cursorClass} ${labelClassName}`.trim()}
      >
        <input
          type="checkbox"
          id={inputId}
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
          className={checkboxClasses}
          {...rest}
        />
        <span className="text-sm text-gray-700">{label}</span>
      </label>
      {children}
    </div>
  );
};
export default BaseCheckbox;
