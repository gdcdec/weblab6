import React from 'react';
import classNames from 'classnames';
import styles from './Button.module.scss';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  fullWidth = false,
  children,
  className,
  ...props
}) => {
  return (
    <button
      className={classNames(
        styles.button,
        styles[variant],
        {[styles.fullWidth]: fullWidth},
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
