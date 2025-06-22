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




// 測試 Socket
io.on("connection", (socket) => {
  console.log("🟢 使用者連線：", socket.id);
  socket.on("disconnect", () => {
    console.log("🔴 使用者離線：", socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
