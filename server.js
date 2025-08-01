const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const http = require("http");
const socketio = require("socket.io");
const allowedOrigin = process.env.FRONTEND_URL;

// Load .env
dotenv.config();

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || origin === allowedOrigin) {
      callback(null, true);
    } else {
      console.warn("❌ CORS blocked:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
};


// Initialize Express
const app = express();

// Allow CORS
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Initialize Socket.IO
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET','POST'],
    allowedHeaders: ['Content-Type','Authorization'],
    credentials: true
  }
});
app.set('io', io);

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true , limit: "10mb" }));

app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
const authRoutes = require("./routes/auth");
const reportRoutes = require("./routes/reports");
const chatRoutes = require("./routes/chats");
const messageRoutes = require("./routes/messages");
const notificationRoutes = require("./routes/notification");
const rescueRoutes = require("./routes/rescue");
const carRoutes = require("./routes/cars");
const volunteerRoutes = require("./routes/volunteers");
const callController = require("./controllers/callController");
const userRoutes = require("./routes/users");

app.use("/api/volunteer", volunteerRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/rescue", rescueRoutes);
app.use("/api/user", userRoutes);

// Call monitoring endpoint
app.get("/api/calls/active", callController.getActiveCalls);

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected"))
  .catch((err) => console.error("DB Error", err));

// Socket.IO listeners
io.on("connection", (socket) => {
  socket.on('joinUser', id => socket.join(`user_${id}`));
  socket.on('joinAsVolunteer', () => socket.join('volunteers'));


  // Join specific chat room
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined chat ${chatId}`);
  });

  // Handle call signaling
  callController.handleCallSignaling(io, socket);

  // 🔄 Notify other user to update chat list after message
  socket.on("messageSent", ({ chatId, toUserId, lastMessageText, timestamp }) => {
    io.to(`user_${toUserId}`).emit("chatListUpdate", {
      chatId,
      lastMessageText,
      timestamp
    });
    console.log(`➡️ Sent chatListUpdate to user_${toUserId} for chat ${chatId}`);
  });

  socket.on("typing", ({ chatId, userId }) => {
    socket.to(chatId).emit("typing", { userId });
  });

  socket.on("stopTyping", ({ chatId, userId }) => {
    socket.to(chatId).emit("stopTyping", { userId });
  });

  socket.on("messageRead", ({ chatId, userId }) => {
    io.to(chatId).emit("messageRead", { chatId, userId });
  });

  socket.on('joinRescueRoom', ({ rescueId, userId }) => {
    const room = `rescue_${rescueId}`;
    socket.join(room);
    console.log(`${userId} joined ${room}`);
  });

  socket.on('locationUpdate', ({ rescueId, userId, coords }) => {
    const room = `rescue_${rescueId}`;
    socket.to(room).emit('locationUpdate', { userId, coords });
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
