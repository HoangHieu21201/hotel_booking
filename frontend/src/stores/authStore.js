// frontend/src/stores/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Sử dụng Zustand kết hợp Middleware persist để tự động lưu vào LocalStorage
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      permissions: [],

      // Hàm gọi khi Login thành công
      setCredentials: (user, token, permissions) => {
        localStorage.setItem('token', token); // Lưu tách token ra để Axios dễ lấy
        set({ user, token, permissions });
      },

      // Hàm gọi khi Logout
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, permissions: [] });
      },
    }),
    {
      name: 'auth-storage', // Key lưu trong LocalStorage
      // Chỉ lưu giữ user và permissions, token đã lưu tách riêng ở trên
      partialize: (state) => ({ user: state.user, permissions: state.permissions }),
    }
  )
);