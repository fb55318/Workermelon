import axios from 'axios';

export const searchUser = async (username: string) => {
  const res = await axios.post('http://localhost:3000/api/User/search', { username });
  return res.data;
};

export const addFriend = async (userId: string, friendUsername: string) => {
  const res = await axios.post('http://localhost:3000/api/User/add-friend', {
    userId,
    friendUsername
  });
  return res.data;
};



export const getFriends = async (userId: string) => {
  const res = await axios.get(`http://localhost:3000/api/User/${userId}/friends`);
  return res.data;
};
