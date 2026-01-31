import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const updateProfile = async (data: any) => {
  const res = await API.patch('/auth/profile', data);
  return res.data;
};

export const getProfile = async () => {
  const res = await API.get('/auth/me');
  return res.data;
};
