const User = require("../models/User");//這是我們連接 MongoDB 中 'users' 集合的橋樑。
const bcrypt = require("bcryptjs");//專門用來「加密」和「比對」密碼的工具，不能將使用者的原始密碼直接存入資料庫
const jwt = require("jsonwebtoken");//用來產生和驗證「Token」的工具。Token 就像一張有期限的「通行證」。



//註冊
// 註冊功能 - 新增更多使用者資訊欄位

exports.register = async (req, res) => {// `exports.register` 讓這個函式可以被其他檔案（例如 UserRoutes.js）引用。  // `(req, res)` 是 Express 的標準參數：req (request) 代表前端傳來的請求物件，res (response) 代表我們要回傳給前端的回應物件。
  const { username, password, nickname, occupation, gender, birthday } = req.body;
  try {
    // 檢查帳號是否存在
    const existingUser = await User.findOne({ username }); // `await` 會暫停函式執行，直到 `User.findOne` 這個非同步操作完成
     // `User.findOne({ username })` 會去資料庫的 'users' 集合中尋找一筆 `username` 欄位與傳入值相同的資料。
    if (existingUser) {
      return res.status(409).json({ error: "帳號已存在" });
    }
     // 加密密碼
    const hashed = await bcrypt.hash(password, 10);
    //建立新使用者
    const newUser = await User.create({
      username,
      password: hashed,
      nickname,
      occupation,
      gender,
      birthday
    });
    //回傳成功訊息
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


exports.getFriends = async (req, res) => {
  const { userId } = req.params;
  
  // --- 開始加入 log ---
  console.log('--- 收到好友列表請求 ---');
  console.log('請求的 userId:', userId); 
  // ---

  try {
    const user = await User.findById(userId).populate('friends', 'username nickname');
    
    // --- 加入 log ---
    console.log('查詢到的使用者:', user ? user.username : '找不到使用者');
    if (user) {
      console.log('關聯查詢後的好友列表:', user.friends);
    }
    // ---

    if (!user) return res.status(404).json({ error: '使用者不存在' });

    // 原本是 res.json({ friends: user.friends });
    // 我們在前端已經修改了處理方式，所以這裡直接回傳陣列
    res.json(user.friends);

  } catch (err) {
    // --- 加入 log ---
    console.error('取得好友清單時發生嚴重錯誤:', err);
    // ---
    res.status(500).json({ error: '取得好友清單失敗' });
  }
};