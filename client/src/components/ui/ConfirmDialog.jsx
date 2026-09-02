import Modal from './Modal';
import Button from './Button';
import { useTranslation } from 'react-i18next';

const ConfirmDialog = ({ open, onClose, onConfirm, title, message, confirmText, cancelText, variant = 'danger' }) => {
  const { t } = useTranslation();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title || t('common.confirm')}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {cancelText || t('common.cancel')}
          </Button>
          <Button
            variant={variant}
            onClick={() => {
              onConfirm?.();
              onClose?.();
            }}
          >
            {confirmText || t('common.confirm')}
          </Button>
        </>
      }
    >
      <p className="text-sm text-app-muted">{message}</p>
    </Modal>
  );
};

export default ConfirmDialog;
