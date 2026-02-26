import React from 'react';
import classNames from 'classnames';
import styles from './ErrorDisplay.module.scss';

interface ErrorDisplayProps {
  message: string | null;
  onClose?: () => void;
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message,
  onClose,
  className,
}) => {
  if (!message) return null;

  return (
    <div className={classNames(styles.error, className)}>
      <span>{message}</span>
      {onClose && (
        <button className={styles.close} onClick={onClose} aria-label="Close">
          &times;
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;
