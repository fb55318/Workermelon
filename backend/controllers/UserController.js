const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");



//註冊
// 註冊功能 - 新增更多使用者資訊欄位
exports.register = async (req, res) => {
  const { username, password, nickname, occupation, gender, birthday } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: "帳號已存在" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      password: hashed,
      nickname,
      occupation,
      gender,
      birthday
    });

    res.status(201).json({
      message: "註冊成功",
      user: {
        _id: newUser._id,
        username: newUser.username,
        nickname: newUser.nickname,
        occupation: newUser.occupation,
        gender: newUser.gender,
        birthday: newUser.birthday
      }
    });
  } catch (err) {
    res.status(500).json({ error: "伺服器錯誤：" + err.message });
  }
};


//login
exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "帳號不存在" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "密碼錯誤" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({
      message: "登入成功",
      token,
      userId: user._id,
      user: {
        _id: user._id,
        username: user.username,
        nickname: user.nickname,
        occupation: user.occupation,
        gender: user.gender,
        birthday: user.birthday
      }
    });
  } catch (err) {
    res.status(500).json({ error: "登入失敗：" + err.message });
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