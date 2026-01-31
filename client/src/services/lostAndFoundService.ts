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

export const fetchLostAndFoundItems = async (params: any = {}) => {
  const res = await API.get('/lost-and-found', { params });
  return res.data;
};

export const fetchLostAndFoundItemById = async (id: string) => {
  const res = await API.get(`/lost-and-found/${id}`);
  return res.data;
};

export const createLostAndFoundItem = async (formData: FormData) => {
  const res = await API.post('/lost-and-found', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const updateLostAndFoundItem = async (id: string, formData: FormData) => {
  const res = await API.patch(`/lost-and-found/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const deleteLostAndFoundItem = async (id: string) => {
  const res = await API.delete(`/lost-and-found/${id}`);
  return res.data;
};

export const claimLostAndFoundItem = async (id: string, contactInfo: any) => {
  const res = await API.post(`/lost-and-found/${id}/claim`, { contactInfo });
  return res.data;
};

export const resolveLostAndFoundItem = async (id: string, resolution: any) => {
  const res = await API.post(`/lost-and-found/${id}/resolve`, { resolution });
  return res.data;
};

export const fetchMyLostAndFoundItems = async (params: any = {}) => {
  const res = await API.get('/lost-and-found/my-items', { params });
  return res.data;
};

export const fetchLostAndFoundStats = async () => {
  const res = await API.get('/lost-and-found/stats');
  return res.data;
};
