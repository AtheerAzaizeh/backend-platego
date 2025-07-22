const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const app = express();
const pool = require('./models/db');


app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const carRoutes = require('./routes/cars');
const reportRoutes = require('./routes/reports');
const messageRoutes = require('./routes/messages');
const chatRoutes = require('./routes/chats');
const rescueRoutes = require('./routes/rescue'); 
const volunteerRoutes = require('./routes/volunteer'); 
const notificationRoutes = require('./routes/notification');
const volunteerUpdatesRouter = require('./routes/volunteerUpdates');
const rescueRequestRoutes = require('./routes/rescue');




app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/rescue', rescueRoutes); 
app.use('/api/volunteer', volunteerRoutes); 
app.use('/api/notifications', notificationRoutes);
app.use('/api/volunteerUpdates', volunteerUpdatesRouter);
app.use('/api/rescue-requests', rescueRequestRoutes);



app.use(express.static(path.join(__dirname, '../frontend')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
