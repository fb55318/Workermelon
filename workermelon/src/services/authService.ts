// src/services/authService.ts
import axios from "axios";
import type { AuthResponse } from "../types/User";

/**
 * 登入功能：只需要帳號與密碼，並取得完整 user 資訊
 */
export const register = async (data: {
  username: string;
  password: string;
  nickname: string;
  occupation: string;
  gender: string;
  birthday: string;
}): Promise<AuthResponse> => {
  //const res = await axios.post("http://localhost:3000/api/User/register", data);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const res = await axios.post(`${API_URL}/api/User/register`, data);
  return res.data;
};

export const login = async (
  username: string,
  password: string
): Promise<AuthResponse> => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const res = await axios.post(`${API_URL}/api/User/login`, {
    username,
    password
  });
  return res.data;
};
