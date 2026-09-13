import React from 'react';
import './Button.css';
import { Loader2 } from 'lucide-react';

const Button = ({ children, onClick, disabled, loading, type = 'button', variant = 'primary', className = '', ...props }) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="btn-spinner" size={18} />}
      {children}
    </button>
  );
};

export default Button;
