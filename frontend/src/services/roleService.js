// frontend/src/services/roleService.js
import axiosInstance from '../utils/axios';

export const roleService = {
  getAll: async () => {
    const response = await axiosInstance.get('/admin/roles');
    return response.data;
  },
  getById: async (id) => {
    const response = await axiosInstance.get(`/admin/roles/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await axiosInstance.post('/admin/roles', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await axiosInstance.put(`/admin/roles/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await axiosInstance.delete(`/admin/roles/${id}`);
    return response.data;
  }
};