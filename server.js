const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const http = require('http');
const socketio = require('socket.io');

// Load .env
dotenv.config();


// Initialize Express
const app = express();

const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const chatRoutes = require('./routes/chats');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notification');
const rescueRoutes = require('./routes/rescue');
const carRoutes = require('./routes/cars');
const volunteerRoutes = require('./routes/volunteers');

app.use('/api/volunteer', volunteerRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/rescue', rescueRoutes);

// MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('DB connected'))
    .catch(err => console.error('DB Error', err));

// Socket.IO listeners
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('joinAsVolunteer', () => {
        socket.join('volunteers');
        console.log(`Socket ${socket.id} joined 'volunteers' room`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });

      socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat ${chatId}`);
  });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));