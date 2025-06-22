const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");



//註冊
// 註冊功能 - 新增更多使用者資訊欄位
exports.register = async (req, res) => {
  // 從前端請求中解構出所有需要的欄位
  const { username, password, nickname, job, gender, birthday } = req.body;

  try {
    // 將使用者密碼進行雜湊處理（bcrypt 加密）
    const hashed = await bcrypt.hash(password, 10);

    // 建立使用者資料（新增的欄位會一併寫入資料庫）
    await User.create({
      username,
      password: hashed,
      nickname,   // 可以為中文，MongoDB 支援 UTF-8
      job,        // 例如 "工程師", "學生", "設計師"...
      gender,     // 例如 "男", "女", "其他"
      birthday    // 建議格式為 "1990-01-01"
    });

    // 回傳成功訊息
    res.status(201).json({ message: "註冊成功" });
  } catch (err) {
    // 若帳號已存在或其他錯誤，回傳錯誤訊息
    res.status(400).json({ error: "註冊失敗，帳號可能已存在" });
  }
};


exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "帳號不存在" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "密碼錯誤" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    
    
    res.json({ message: "登入成功", token,userId: user._id });
  } catch (err) {
    res.status(500).json({ error: "登入失敗" });
  }
};


//搜尋好友 
exports.searchUser = async (req, res) => {
  const { username } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ error: '帳號不存在' });
  return res.json({ userId: user._id });
};

//加好友
exports.addFriend = async (req, res) => {
  const { userId, friendUsername } = req.body;
  const friend = await User.findOne({ username: friendUsername });
  if (!friend) return res.status(404).json({ error: '好友帳號不存在' });

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: '使用者不存在' });

  // 若好友已存在就略過
  if (user.friends.includes(friend._id)) {
    return res.json({ message: '已經是好友了' });
  }

  user.friends.push(friend._id);
  await user.save();
  return res.json({ message: '好友已新增' });
};