import API from './api';

export const fetchIssues = async () => {
  const res = await API.get('/issues');
  return res.data;
};

export const fetchIssueById = async (id: string) => {
  const res = await API.get(`/issues/${id}`);
  return res.data;
};

export const fetchCommentsByIssueId = async (issueId: string) => {
  const res = await API.get(`/issues/${issueId}/comments`);
  return res.data;
};

export const createComment = async (issueId: string, content: string, isInternal = false) => {
  const res = await API.post(`/issues/${issueId}/comments`, { content, isInternal });
  return res.data;
};

export const addReaction = async (commentId: string, type: string) => {
  const res = await API.post(`/comments/${commentId}/reactions`, { type });
  return res.data;
};

export const createIssue = async (data: any) => {
  const res = await API.post('/issues', data);
  return res.data;
};

export const updateIssueStatus = async (issueId: string, newStatus: string, remarks?: string) => {
  const res = await API.patch(`/issues/${issueId}/status`, { newStatus, remarks });
  return res.data;
};

export const fetchIssueLogs = async (issueId: string) => {
  try {
    console.log('Fetching issue logs for:', issueId);
    const res = await API.get(`/issues/${issueId}/logs`);
    console.log('Issue logs response:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error fetching issue logs:', error);
    throw error;
  }
};
