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

export const fetchDashboardStats = async () => {
  const res = await API.get('/issues/stats');
  return res.data;
};

export const fetchRecentIssues = async (limit = 5) => {
  const res = await API.get(`/issues?limit=${limit}&sortBy=createdAt&sortOrder=desc`);
  return res.data;
};

export const fetchRecentAnnouncements = async (limit = 3) => {
  const res = await API.get(`/announcements?limit=${limit}&sortBy=createdAt&sortOrder=desc`);
  return res.data;
};

export const fetchLostAndFoundStats = async () => {
  const res = await API.get('/lost-and-found/stats');
  return res.data;
};
