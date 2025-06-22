// src/services/authService.ts
import axios from "axios";
import type { AuthResponse } from "../types/User";

/**
 * 登入功能：只需要帳號與密碼
 */
export const login = async (username: string, password: string): Promise<AuthResponse> => {
  const res = await axios.post("http://localhost:3000/api/User/login", {
    username,
    password
  });
  return res.data;
};

/**
 * 註冊功能：需要完整的使用者資料
 */
export const register = async (data: {
  username: string;
  password: string;
  nickname: string;
  job: string;
  gender: string;
  birthday: string;
}): Promise<AuthResponse> => {
  const res = await axios.post("http://localhost:3000/api/User/register", data);
  return res.data;
};
