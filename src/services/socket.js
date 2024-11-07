const { Server } = require('socket.io');

exports.connectSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('send-private-msg', (msgObj) => {
            msgObj.isUser = false;
            socket.broadcast.emit('receive-private-msg', msgObj);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
};
