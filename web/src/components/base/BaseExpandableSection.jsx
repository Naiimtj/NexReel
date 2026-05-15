import { useState } from 'react';
import BaseIcon from './BaseIcon';

const BaseExpandableSection = ({
  title,
  disabledHighlight = false,
  styleClass = 'flex flex-col gap-2 items-start',
  withoutContentPadding = false,
  isOpenInitially = false,
  children,
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(isOpenInitially);

  const toggleOpening = () => setIsOpen((prev) => !prev);

  let containerClass = 'flex flex-col items-start w-full';
  if (!disabledHighlight) {
    const borderClass = isOpen
      ? 'border-[1.5px] border-purpleNR'
      : 'border border-gray-300 hover:border-purpleNR';
    containerClass = `flex flex-col items-start w-full rounded-md shadow-sm hover:shadow-md ${borderClass} bg-white`;
  }

  return (
    <div className={`${containerClass} ${className}`.trim()} {...props}>
      <button
        type="button"
        onClick={toggleOpening}
        aria-expanded={isOpen}
        className="cursor-pointer p-4 flex flex-row items-center w-full justify-start gap-4 rounded-md text-gray-700 hover:text-purpleNR group"
      >
        <BaseIcon icon={isOpen ? 'arrowDown' : 'arrowRight'} />
        <span className="text-2xl font-medium">{title}</span>
      </button>

      {isOpen && (
        <div
          className={`w-full ${withoutContentPadding ? '' : 'px-4 pb-6'} ${styleClass}`}
        >
          {children}
        </div>
      )}
    </div>
  );
};
export default BaseExpandableSection;
