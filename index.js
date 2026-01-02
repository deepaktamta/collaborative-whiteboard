const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        // Adding your Vercel URL and Localhost for development
        origin: [
            "https://collaborative-whiteboard-x2sq.vercel.app", 
            "http://localhost:5173"
        ],
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room: ${room}`);
    });

    socket.on('drawing', (data) => {
        // Broadcasts drawing data to everyone in the room except the sender
        socket.to(data.room).emit('drawing', data);
    });

    socket.on('clear_canvas', (room) => {
        socket.to(room).emit('clear_canvas');
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected');
    });
});

// Render provides the PORT automatically through process.env.PORT
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`SERVER RUNNING ON PORT ${PORT}`);
});