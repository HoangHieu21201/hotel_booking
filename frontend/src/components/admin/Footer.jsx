// frontend/src/components/admin/Footer.jsx
import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6 text-center text-sm text-gray-500">
      &copy; {new Date().getFullYear()} Hotel PMS System. All rights reserved.
    </footer>
  );
}