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

export const createPoll = async (pollData: any) => {
  const res = await API.post('/polls', pollData);
  return res.data;
};

export const getPolls = async () => {
  const res = await API.get('/polls');
  return res.data;
};

export const getPollById = async (pollId: string) => {
  const res = await API.get(`/polls/${pollId}`);
  return res.data;
};

export const voteOnPoll = async (pollId: string, optionIndex: number) => {
  const res = await API.post(`/polls/${pollId}/vote`, { optionIndex });
  return res.data;
};
