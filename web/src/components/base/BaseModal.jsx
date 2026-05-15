import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import BaseIcon from './BaseIcon';
import { t } from 'i18next';

const BaseModal = ({
  visible = false,
  title,
  onClose,
  fullscreen = false,
  fullHeight = false,
  fullWidth = false,
  closeButtonHidden = false,
  className = '',
  overlayClassName = '',
  children,
  ...props
}) => {
  useEffect(() => {
    if (!visible) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [visible, onClose]);

  if (!visible) return null;

  let sizeClasses = 'w-[75vw] h-auto';
  if (fullscreen) sizeClasses = 'w-screen h-screen';
  else if (fullHeight) sizeClasses = 'h-screen max-w-[90vw]';
  else if (fullWidth) sizeClasses = 'w-screen max-h-[90vh]';

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && onClose) onClose();
  };

  const handleOverlayKey = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
      e.preventDefault();
      if (onClose) onClose();
    }
  };

  const modal = (
    <div
      className={`fixed top-0 left-0 w-screen h-screen bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 ${overlayClassName}`.trim()}
      onClick={handleOverlayClick}
      onKeyDown={handleOverlayKey}
      {...props}
    >
      <dialog
        open
        aria-modal="true"
        className={`text-black rounded-xl shadow-2xl relative overflow-y-auto p-0 ${sizeClasses} ${className}`.trim()}
      >
        {!closeButtonHidden && (
          <BaseIcon
            icon="close"
            className="transition duration-200 md:hover:fill-gray-400 fill-purpleNR mb-1"
            wrapperClassName="sticky z-10 top-1 mr-1 flex justify-end"
            onClick={onClose}
            tooltip={t('Close')}
            tooltipPosition="top"
          />
        )}
        <div className="md:px-2 px-1 md:pb-2 pb-1">
          {title && (
            <h2 className="text-2xl font-semibold text-grayNR md:mb-4 mb-2 text-center">
              {title}
            </h2>
          )}
          {children}
        </div>
      </dialog>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modal, document.body);
};
export default BaseModal;
