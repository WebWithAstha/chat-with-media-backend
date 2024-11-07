require('dotenv').config(); // Load environment variables

// Core Imports
const express = require('express');
const { createServer } = require('http');
const app = express();

// Utility and Config Imports
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/auth.routes');
const messageRoutes = require('./src/routes/message.routes');
const { connectSocket } = require('./src/services/socket');

// Database Connection
connectDB();

// Middleware Setup
app.use(express.json()); // Body parser for JSON
app.use(express.urlencoded({ extended: true })); // Body parser for URL-encoded data
app.use(require('morgan')('tiny')); // Morgan logging
app.use(require('cors')({
    origin: 'http://localhost:5173',
    methods: "*",
    credentials: true
})); // CORS setup

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// Socket Setup
const httpServer = createServer(app);
connectSocket(httpServer);

// Server Listen
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
