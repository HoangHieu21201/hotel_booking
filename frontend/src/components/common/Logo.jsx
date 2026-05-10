// frontend/src/components/common/Logo.jsx
import React from 'react';
import { Hotel } from 'lucide-react';

export default function Logo({ showText = true, showSlogan = true, size = 'md', className = '' }) {
  const sizes = {
    // Tăng chút xíu kích thước icon lúc thu nhỏ Sidebar (sm) cho cân đối
    sm: { icon: 'h-6 w-6', text: 'text-xl', slogan: 'text-[10px]' }, 
    md: { icon: 'h-7 w-7', text: 'text-2xl', slogan: 'text-xs' },
    lg: { icon: 'h-10 w-10', text: 'text-4xl', slogan: 'text-sm' },
  };

  const activeSize = sizes[size] || sizes.md;

  return (
    <div className={`flex flex-col select-none ${className}`}>
      <div className="flex items-center gap-2 justify-center">
        {/* Luôn hiển thị Icon */}
        <div className={`bg-primary text-white p-1.5 rounded-lg shadow-sm shrink-0 flex items-center justify-center ${activeSize.icon}`}>
          <Hotel className="w-full h-full" />
        </div>

        {/* Chỉ hiển thị Text khi showText = true. Thêm whitespace-nowrap để chống ép rớt dòng */}
        {showText && (
          <h1
            className={`${activeSize.text} font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-primary to-gray-800 bg-[length:200%_auto] animate-shine whitespace-nowrap`}
          >
            Availio
          </h1>
        )}
      </div>

      {/* Chỉ hiển thị Slogan khi showSlogan và showText đều bằng true */}
      {showText && showSlogan && (
        <span className={`${activeSize.slogan} text-gray-500 font-medium tracking-wide mt-0.5 ml-1 opacity-80 uppercase whitespace-nowrap`}>
          Smart Availability Engine
        </span>
      )}
    </div>
  );
}