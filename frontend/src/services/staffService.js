// frontend/src/services/staffService.js
import axiosInstance from '../utils/axios';

export const staffService = {
  getAll: async () => {
    const response = await axiosInstance.get('/admin/staffs');
    return response.data;
  },
  getById: async (id) => {
    const response = await axiosInstance.get(`/admin/staffs/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await axiosInstance.post('/admin/staffs', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await axiosInstance.put(`/admin/staffs/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await axiosInstance.delete(`/admin/staffs/${id}`);
    return response.data;
  },
  restore: async (id) => {
    const response = await axiosInstance.patch(`/admin/staffs/${id}/restore`);
    return response.data;
  }
};