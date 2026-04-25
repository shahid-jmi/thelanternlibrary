import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bookstore-admin-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getBooks = (params) => api.get('/books', { params }).then(res => res.data);
export const getBook = (id, lang) => api.get(`/books/${id}`, { params: { lang } }).then(res => res.data);

export const adminLogin = (password) => api.post('/admin/auth/login', { password }).then(res => res.data);
export const adminGetBooks = () => api.get('/admin/books').then(res => res.data);
export const adminCreateBook = (data) => api.post('/admin/books', data).then(res => res.data);
export const adminUpdateBook = (id, data) => api.put(`/admin/books/${id}`, data).then(res => res.data);
export const adminDeleteBook = (id) => api.delete(`/admin/books/${id}`).then(res => res.data);
export const adminToggleAvailability = (id, isAvailable) => api.patch(`/admin/books/${id}/availability`, { isAvailable }).then(res => res.data);

export default api;
