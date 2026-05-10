// frontend/src/components/ui/Button.jsx
import React from 'react';
import { Loader2 } from 'lucide-react'; // Dùng thẳng Lucide cho Spinner gọn nhẹ

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  iconLeft: IconLeft, 
  iconRight: IconRight, 
  className = '', 
  disabled, 
  ...props 
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg active:scale-[0.98]';
  
  // Sử dụng hover:opacity-90 để tôn trọng màu primary gốc của dự án
  const variants = {
    primary: 'bg-primary text-white hover:opacity-90 shadow-sm',
    danger: 'bg-danger text-gray-900 hover:opacity-90 shadow-sm', // Theo file tailwind, màu danger của bạn hơi nhạt nên text để xám đậm
    warning: 'bg-warning text-white hover:opacity-90 shadow-sm',
    outline: 'border border-gray-200 bg-white text-gray-700 hover:border-primary hover:text-primary hover:bg-primary/5',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : IconLeft ? (
        <IconLeft className="w-4 h-4 mr-2" />
      ) : null}
      
      <span>{children}</span>
      
      {!isLoading && IconRight && (
        <IconRight className="w-4 h-4 ml-2" />
      )}
    </button>
  );
}