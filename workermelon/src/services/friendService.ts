import axios from 'axios';

export const searchUser = async (username: string) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const res = await axios.post(`${API_URL}/api/User/search`, { username });
  return res.data;
};

export const addFriend = async (userId: string, friendUsername: string) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const res = await axios.post(`${API_URL}/api/User/add-friend`, {
    userId,
    friendUsername
  });
  return res.data;
};



export const getFriends = async (userId: string) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const res = await axios.get(`${API_URL}/api/User/${userId}/friends`);
  return res.data;
};
