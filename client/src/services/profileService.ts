import API from './api';

export const updateProfile = async (data: any) => {
  const res = await API.patch('/auth/profile', data);
  return res.data;
};

export const getProfile = async () => {
  const res = await API.get('/auth/me');
  return res.data;
};
