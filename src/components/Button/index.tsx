import React from 'react';
import styles from './styles.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  className,
  children,
  ...props
}) => {
  const buttonClass = [
    styles.button,
    styles[variant],
    styles[size],
    className
  ].filter(Boolean).join(' ');

  return (
    <button className={buttonClass} {...props}>
      {children}
    </button>
  );
};