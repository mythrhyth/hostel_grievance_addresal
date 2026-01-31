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

export const fetchAnnouncements = async () => {
  const res = await API.get('/announcements');
  return res.data;
};

export const createAnnouncement = async (data: any) => {
  const res = await API.post('/announcements', data);
  return res.data;
};

export const updateAnnouncement = async (id: string, data: any) => {
  const res = await API.patch(`/announcements/${id}`, data);
  return res.data;
};

export const deleteAnnouncement = async (id: string) => {
  const res = await API.delete(`/announcements/${id}`);
  return res.data;
};
