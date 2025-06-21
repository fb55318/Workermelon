import axios from "axios";

export const login = async (username: string, password: string) => {
  const res = await axios.post("http://localhost:3000/api/login", { username, password });
  return res.data;
};

export const register = async (username: string, password: string) => {
  const res = await axios.post("http://localhost:3000/api/register", { username, password });
  return res.data;
};
