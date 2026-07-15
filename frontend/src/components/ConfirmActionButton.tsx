import React from 'react';
import { useNotification } from '../context/NotificationContext';

type Props = {
  label: React.ReactNode;
  message: string;
  title?: string;
  onConfirm: () => void | Promise<void>;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
};

/**
 * List/table action button that always asks for confirmation before running.
 */
export const ConfirmActionButton: React.FC<Props> = ({
  label,
  message,
  title = 'Confirm action',
  onConfirm,
  className,
  disabled,
  type = 'button',
}) => {
  const { showConfirm } = useNotification();

  return (
    <button
      type={type}
      disabled={disabled}
      className={className}
      onClick={() => {
        if (disabled) return;
        showConfirm(message, () => {
          void onConfirm();
        }, title);
      }}
    >
      {label}
    </button>
  );
};

/** Imperative helper for pages that already use showConfirm wiring. */
export function useConfirmAction() {
  const { showConfirm } = useNotification();
  return (message: string, action: () => void | Promise<void>, title = 'Confirm action') => {
    showConfirm(message, () => {
      void action();
    }, title);
  };
}
