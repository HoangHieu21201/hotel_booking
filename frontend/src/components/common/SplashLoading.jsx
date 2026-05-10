// frontend/src/components/common/SplashLoading.jsx
import React, { useEffect, useState } from 'react';

export default function SplashLoading({ onFinish }) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Giữ màn hình loading 2 giây
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2000);

    // Gỡ component sau 2.5 giây
    const removeTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 2500);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(removeTimer);
    };
  }, [onFinish]);

  return (
    <>
      {/* Nhúng trực tiếp CSS Animation vào component để đảm bảo 
        luôn luôn hoạt động mượt mà không cần restart lại Tailwind/Vite 
      */}
      <style>
        {`
          @keyframes shine-wave {
            0% { background-position: 200% center; }
            100% { background-position: -200% center; }
          }
          @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-shine-wave {
            background-image: linear-gradient(110deg, rgb(63, 125, 88) 35%, rgb(167, 243, 208) 50%, rgb(63, 125, 88) 65%);
            background-size: 200% auto;
            color: transparent;
            -webkit-background-clip: text;
            background-clip: text;
            animation: shine-wave 2s linear infinite;
          }
          .animate-slogan {
            animation: fade-in-up 0.8s ease-out forwards;
            animation-delay: 0.4s;
            opacity: 0; /* Bắt đầu ẩn, sau 0.4s sẽ chạy animation và giữ ở trạng thái hiện */
          }
        `}
      </style>

      <div 
        className={`fixed inset-0 z-[999] flex flex-col items-center justify-center bg-gray-50 transition-opacity duration-500 ${
          isFadingOut ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="flex flex-col items-center text-center px-4">
          
          {/* Logo được thu nhỏ lại (text-5xl/6xl thay vì 8xl), gọn gàng và tinh tế hơn */}
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-3 animate-shine-wave drop-shadow-sm">
            Availio
          </h1>
          
          {/* Slogan hiện lên mượt mà và chắc chắn không bị lỗi ẩn */}
          <p className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-gray-400 uppercase animate-slogan">
            Smart Availability Engine <span className="hidden sm:inline">for Modern Hotels</span>
          </p>

        </div>
      </div>
    </>
  );
}