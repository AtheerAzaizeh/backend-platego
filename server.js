const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');

// Load .env
dotenv.config();

// Connect to DB
connectDB();

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const chatRoutes = require('./routes/chats');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notification');
const rescueRoutes = require('./routes/rescue');
const carRoutes = require('./routes/cars');


app.use('/api/cars', carRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/rescue', rescueRoutes);
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
