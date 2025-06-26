export interface User {
  _id: string;
  username: string;
  nickname: string;
  job: string;
  gender: string;
  birthday: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  message: string;
  user: User; // 加上這行！
}
//  AuthResponse 是「登入/註冊」API 的回傳格式
// 這個回傳格式（介面）只包含你「登入成功後需要」用到的幾個欄位