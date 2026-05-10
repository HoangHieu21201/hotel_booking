// frontend/src/components/ui/Spinner.jsx
import React from 'react';

export default function Spinner({ size = 'md', className = '' }) {
  // Cấu hình kích thước (hộp) và độ dày viền (px) cho Comet Spinner
  const sizeClasses = {
    sm: { box: 'w-4 h-4', border: 2 },
    md: { box: 'w-5 h-5', border: 2.5 },
    lg: { box: 'w-8 h-8', border: 3 },
    xl: { box: 'w-12 h-12', border: 4 }
  };

  const activeSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`relative animate-spin ${activeSize.box} ${className}`}>
      {/* 1. Vòng Comet với hiệu ứng đuôi mờ dần 
        - Sử dụng conic-gradient để quét màu 360 độ từ trong suốt đến đậm đặc.
        - Dùng maskImage (kỹ thuật đục lỗ) để khoét rỗng ruột bên trong, tạo thành hình chiếc nhẫn.
      */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0%, currentColor 100%)',
          WebkitMaskImage: `radial-gradient(farthest-side, transparent calc(100% - ${activeSize.border}px), black calc(100% - ${activeSize.border - 0.5}px))`,
          maskImage: `radial-gradient(farthest-side, transparent calc(100% - ${activeSize.border}px), black calc(100% - ${activeSize.border - 0.5}px))`,
        }}
      />
      
      {/* 2. Nút bo tròn ở phần đầu (Leading Edge)
        - Điểm chốt chặn ở hướng 12 giờ để làm mềm mép cắt sắc lẹm của conic-gradient
      */}
      <div
        className="absolute bg-current rounded-full"
        style={{
          width: activeSize.border,
          height: activeSize.border,
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
    </div>
  );
}