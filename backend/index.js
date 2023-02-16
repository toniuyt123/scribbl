const path = require('path');
const cors = require('cors');
const express = require('express');

const app = express();
const port = 3000;

const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')))
//io.set('log level', 1);

const rooms = io.of("/").adapter.rooms;
const sids = io.of("/").adapter.sids;

function userRoom(id) {
    return Array.from(sids.get(id))[0];
}

const roomInfo = {};

function addUserToRoom(params) {
    roomInfo[params.room] ||= { users: {}, round: 0, word: '' };
    roomInfo[params.room].users[params.socketId] = {
        username: params.username,
        points: 0,
        rank: 1,
        isDrawing: false,
    };
}

app.get('/users/:roomId', (req, res) => {
    if (roomInfo[req.params.roomId] == undefined) {
        return res.send([]);
    }

    const resArr = Object.keys(roomInfo[req.params.roomId].users).map(key => { return roomInfo[req.params.roomId].users[key] });
    //console.log(res);
    //console.log(roomInfo[req.params.roomId] || [])
    return res.send(resArr);
});

io.on('connection', (socket) => {
    socket.on('join', (data) => {
        if (data.room == undefined) {
            // const roomId = (new Date()).getTime();
            // socket.join(roomId);
            // console.log('Joinned', roomId);

            return;
        }

        
        //ASSERT(rooms[room].length < 8)
        socket.join(data.room);
        socket.leave(socket.id);

        data.username ||= `Player ${rooms.get(data.room).size}`;
        data.socketId = socket.id;
        addUserToRoom(data);

        socket.to(userRoom(socket.id)).emit('joined', {
            username: data.username,
        });
    });

    socket.on('mousemove', (data) => {
        //console.log(sids, socket.id);
        socket.to(userRoom(socket.id)).emit('drawing', data);
    });

    socket.on('msg', (data) => {
        //console.log(userRoom(socket.id));
        //console.log(sids, rooms, socket.id)
        socket.to(userRoom(socket.id)).emit('msg', data);
    });

    socket.on("disconnecting", (reason) => {
        if (roomInfo[userRoom(socket.id)] == undefined) {
            return;
        }
        
        socket.to(userRoom(socket.id)).emit('leave', {
            username: roomInfo[userRoom(socket.id)].users[socket.id].username
        });

        delete roomInfo[userRoom(socket.id)].users[socket.id];
    });
});

http.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
 });