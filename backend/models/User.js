const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // 帳號
  password: { type: String, required: true },                // 密碼
  nickname: { type: String, default: "" },                   // 暱稱（可選）
  occupation: { type: String, default: "" },                 // 職業（可選）
  gender: { type: String, enum: ["男", "女", "其他"], default: "其他" }, // 性別
  birthday: { type: Date },                                  // 生日（年月日）
  createdAt: { type: Date, default: Date.now },              // 註冊時間
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // 好友列表
});

const User = mongoose.model("User", userSchema);
module.exports = User;
