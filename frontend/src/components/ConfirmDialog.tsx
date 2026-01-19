import React from 'react';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  showReasonInput?: boolean;
  reasonLabel?: string;
  reasonValue?: string;
  onReasonChange?: (reason: string) => void;
  confirmDisabled?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  showReasonInput = false,
  reasonLabel = 'Reason (required)',
  reasonValue = '',
  onReasonChange,
  confirmDisabled = false,
}) => {
  if (!open) return null;

  const handleConfirm = () => {
    if (showReasonInput && !reasonValue?.trim()) {
      return; // Don't confirm if reason is required but empty
    }
    if (confirmDisabled) {
      return;
    }
    onConfirm();
  };

  return (
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className={`confirm-dialog-header variant-${variant}`}>
          <h3>{title}</h3>
        </div>
        <div className="confirm-dialog-body">
          <p>{message}</p>
          {showReasonInput && (
            <div className="reason-input-group">
              <label htmlFor="reason-input">{reasonLabel}</label>
              <textarea
                id="reason-input"
                value={reasonValue}
                onChange={(e) => onReasonChange?.(e.target.value)}
                placeholder={reasonLabel.includes('Optional') ? 'Enter notes (optional)...' : 'Enter reason...'}
                rows={3}
                className="reason-input"
                required={!reasonLabel.includes('Optional')}
              />
            </div>
          )}
        </div>
        <div className="confirm-dialog-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={handleConfirm}
            disabled={confirmDisabled || (showReasonInput && !reasonValue?.trim())}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
