// frontend/src/components/ui/Image.jsx
import React, { useState } from 'react';

// Trỏ trực tiếp vào ảnh dự phòng nằm trong thư mục frontend/public/
const placeholderImg = "/img_placeholder.jpg";

export default function Image({ src, alt, className = '', ...props }) {
  const [error, setError] = useState(false);

  const handleError = () => {
    setError(true);
  };

  return (
    <img
      src={error || !src ? placeholderImg : src}
      alt={alt || 'Image'}
      className={`object-cover ${className}`}
      onError={handleError}
      {...props}
    />
  );
}