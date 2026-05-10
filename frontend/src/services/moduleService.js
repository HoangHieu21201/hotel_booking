import axiosInstance from '../utils/axios';

export const moduleService = {
  getAll: async () => {
    const response = await axiosInstance.get('/admin/modules');
    return response.data;
  },
  sync: async () => {
    const response = await axiosInstance.post('/admin/modules/sync');
    return response.data;
  },
  update: async (id, data) => {
    const response = await axiosInstance.put(`/admin/modules/${id}`, data);
    return response.data;
  }
};