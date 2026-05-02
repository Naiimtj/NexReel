import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import BaseModal from '../BaseModal';
import BaseButton from '../../base/BaseButton';

const DeleteConfirmModal = ({
  visible,
  onConfirm,
  onCancel,
  title,
  message,
  itemName,
  confirmLabel,
  cancelLabel,
  loading = false,
}) => {
  const [t] = useTranslation('translation');

  const handleConfirm = () => {
    if (loading) return;
    if (onConfirm) onConfirm();
  };

  return (
    <BaseModal
      visible={visible}
      title={title || t('Are you sure you want to delete?')}
      onClose={onCancel}
    >
      <div className="bg-white text-black flex flex-col rounded-xl text-center text-xl w-full">
        {message && <p className="text-center text-gray-700">{message}</p>}
        {itemName && (
          <p className="text-center text-gray-500 line-clamp-2 text-sm">
            {itemName}
          </p>
        )}
        <div className="w-full flex items-center justify-center gap-4">
          <BaseButton onClick={onCancel} disabled={loading} className="w-full">
            {cancelLabel || t('No')}
          </BaseButton>
          <BaseButton
            onClick={handleConfirm}
            disabled={loading}
            className="w-full"
          >
            {confirmLabel || t('Yes')}
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  );
};

DeleteConfirmModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  title: PropTypes.node,
  message: PropTypes.node,
  itemName: PropTypes.node,
  confirmLabel: PropTypes.node,
  cancelLabel: PropTypes.node,
  loading: PropTypes.bool,
};

export default DeleteConfirmModal;
