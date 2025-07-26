const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const UserRoutes = require('./routes/UserRoutes')


require("dotenv").config();

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json()); // 支援 JSON 請求
app.use('/api/User', UserRoutes);
// 連接 MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true, useUnifiedTopology: true
}).then(() => console.log("✅ 已連接 MongoDB"))
  .catch((err) => console.error("❌ 連線失敗", err));


// +++ 新增這一行來定義 userSocketMap +++
const userSocketMap = {};

// 測試 Socket
io.on("connection", (socket) => {
  console.log("🟢 使用者連線：", socket.id);

  // 註冊使用者的部分，維持不變
  socket.on('registerUser', (userId) => {
    userSocketMap[userId] = socket.id;
    console.log(`📝 使用者 ${userId} 已註冊，對應的 socket ID 是 ${socket.id}`);
    console.log("目前線上使用者:", userSocketMap);
  });

// --- START: 新增私人訊息處理邏輯 ---
  socket.on('private message', ({ recipientId, text }) => {
    // 從 socket 連線中找出發送者是誰
    // 這是為了安全，不讓前端隨意假冒發送者
    const senderId = Object.keys(userSocketMap).find(
      key => userSocketMap[key] === socket.id
    );

    if (!senderId) {
      console.log('⚠️ 警告：收到來自未註冊使用者的訊息');
      return;
    }

    console.log(`💬 收到來自 ${senderId} 給 ${recipientId} 的私人訊息: ${text}`);

 // 從對應表中找出接收者的 socket ID
    const recipientSocketId = userSocketMap[recipientId];

    const messagePayload = {
      senderId: senderId,
      recipientId: recipientId,
      text: text,
      timestamp: new Date()
    };

    if (recipientSocketId) {
      // 如果接收者在線上，就將訊息發送給他
      io.to(recipientSocketId).emit('private message', messagePayload);
      console.log(`✅ 訊息已發送給 ${recipientId}`);
    } else {
      // 如果接收者離線，可以先在這裡印出日誌
      // 未來可以將訊息存到資料庫，等對方上線後再發送
      console.log(`🚫 使用者 ${recipientId} 目前離線，訊息無法即時發送`);
    }

    // 同時，也將這則訊息回傳給發送者自己，讓發送方的 UI 也能即時更新
    socket.emit('private message', messagePayload);
  });
  // --- END: 新增私人訊息處理邏輯 ---
  // 使用者離線的部分，維持不變
  socket.on("disconnect", () => {
    console.log("🔴 使用者離線：", socket.id);
    for (const userId in userSocketMap) {
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
        console.log(`🗑️ 使用者 ${userId} 已從對應表中移除`);
        break;
      }
    }
    console.log("目前線上使用者:", userSocketMap);
  });
});
/*socket.on('private message', ...): 我們建立一個新的事件監聽器，專門處理名為 private message 的事件。
找出發送者 (senderId): 為了安全，我們不相信前端傳來的發送者資訊。我們反過來用 socket.id 去 userSocketMap 裡查出這個連線到底是哪個 userId，這可以防止偽造身份。
找出接收者 (recipientSocketId): 我們從前端傳來的 recipientId (目標好友的ID) 去 userSocketMap 裡查出他對應的 socket.id。
io.to(recipientSocketId).emit(...): 這是 Socket.IO 的核心功能。它會只對指定的 recipientSocketId 發送訊息，而不是廣播給所有人。
socket.emit(...): 我們也把這則訊息發回給發送者自己。這非常重要，這樣發送者才能在自己的畫面上看到自己剛剛發出去的訊息。
離線處理: 如果 userSocketMap 裡找不到接收者的 socket，就表示對方不在線上。目前我們先印出一條日誌，未來這裡就是儲存「離線訊息」到資料庫的絕佳位置。*/

const PORT = process.env.PORT || 3000; // 優先使用環境變數 PORT，如果沒有才用 3000
server.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
