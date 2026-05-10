// frontend/src/stores/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      permissions: [],

      setCredentials: (user, token, permissions) => {
        localStorage.setItem('admin_token', token); // Lưu tách biệt với customer
        set({ user, token, permissions });
      },

      logout: () => {
        localStorage.removeItem('admin_token');
        set({ user: null, token: null, permissions: [] });
      },
    }),
    {
      name: 'admin-auth-storage', // Đổi tên bộ nhớ đệm
      partialize: (state) => ({ user: state.user, permissions: state.permissions }),
    }
  )
);