const path = require('path');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const socket = require('socket.io')
const io = socket(server);
const {ExpressPeerServer} = require('peer');
const peerServer = ExpressPeerServer(server, {debug: true})
const {v4: uuidv4} = require('uuid');
const { text } = require('express');
const PORT = 3000;
app.set('view engine', 'ejs');
app.use(express.static("public"))
app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
    res.status(200);
    res.redirect(`${uuidv4()}`)
})

app.get('/:room', (req, res) => {
    res.status(200);
    res.render('room', {roomId: req.params.room})
})

io.on('connection', (socket) => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('new-user-connected', userId);
        socket.on('message', (textMessage) => {
            io.to(roomId).emit('createMessage', textMessage, userId)
        })

        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('clear-grid', userId);
        })
    });

    
});

server.listen(PORT);