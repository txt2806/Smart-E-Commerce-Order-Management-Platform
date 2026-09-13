import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './Input.css';

const Input = ({ label, type = 'text', id, error, icon: Icon, onBlur, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === 'password';
  const currentType = isPasswordType && showPassword ? 'text' : type;

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`input-container ${error ? 'has-error' : ''}`}>
      <div className="input-wrapper">
        {Icon && <Icon className="input-icon" size={20} />}
        
        <input
          id={id}
          type={currentType}
          className="input-field"
          placeholder=" "
          onBlur={onBlur}
          {...props}
        />
        <label htmlFor={id} className="input-label">
          {label}
        </label>

        {isPasswordType && (
          <button 
            type="button" 
            className="input-password-toggle" 
            onClick={togglePassword}
            tabIndex="-1"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      
      <div className={`input-error-message ${error ? 'visible' : ''}`}>
        {error}
      </div>
    </div>
  );
};

export default Input;
