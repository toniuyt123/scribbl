const path = require('path');
const cors = require('cors');
const express = require('express');

const app = express();
const port = 3000;

const http = require('http').Server(app);


app.use(cors());
app.use(express.static(path.join(__dirname, 'public')))
//io.set('log level', 1);


const { addRoomTurnCallback, addUserToRoom, startRoom, roomsInfo } = require('./rooms.js');

app.get('/users/:roomId', (req, res) => {
    if (roomsInfo[req.params.roomId] == undefined) {
        return res.send([]);
    }

    //const resArr = Object.keys(roomsInfo[req.params.roomId].users).map(key => { return roomsInfo[req.params.roomId].users[key] });
    //console.log(res);
    //console.log(roomsInfo[req.params.roomId] || [])
    return res.send(roomsInfo[req.params.roomId].users);
});

app.get('/rooms/:roomId', (req, res) => {
    if (roomsInfo[req.params.roomId] == undefined) {
        return res.send({});
    }

    console.log(roomsInfo[req.params.roomId])
    return res.send(roomsInfo[req.params.roomId]);
});

const io = require('socket.io')(http);


const rooms = io.of("/").adapter.rooms;
const sids = io.of("/").adapter.sids;

function userRoom(id) {
    return Array.from(sids.get(id))[0];
}

io.on('connection', (socket) => {
    socket.on('join', (data, callback) => {
        if (data.roomId == undefined) {
            // const roomId = (new Date()).getTime();
            // socket.join(roomId);
            // console.log('Joinned', roomId);

            return;
        }

        
        //ASSERT(rooms[room].length < 8)
        socket.join(data.roomId);
        socket.leave(socket.id);

        data.username ||= `Player ${rooms.get(data.roomId).size}`;
        data.socketId = socket.id;
        addUserToRoom(data);

        socket.to(userRoom(socket.id)).emit('joined', {
            username: data.username,
        });

        callback({ status: 'ok' });
    });

    socket.on('mousemove', (data) => {
        const room = roomsInfo[userRoom(socket.id)];

        if (room.users[room.drawingUser].socketId !== socket.id) {
            return;
        }
        //console.log(sids, socket.id);
        socket.to(userRoom(socket.id)).emit('drawing', data);
    });

    socket.on('msg', (data) => {
        //console.log(userRoom(socket.id));
        //console.log(sids, rooms, socket.id)
        socket.to(userRoom(socket.id)).emit('msg', data);
    });

    socket.on('startRoom', (data) => {
        startRoom(userRoom(socket.id));
    });

    socket.on("disconnecting", (reason) => {
        //console.log(roomsInfo, userRoom(socket.id))
        if (roomsInfo[userRoom(socket.id)] == undefined) {
            return;
        }
        
        let leavingUser;
        let leavingUserIdx = 0;
        for (const user of roomsInfo[userRoom(socket.id)].users) {
            //console.log(user, socket.id)
            if (user.socketId == socket.id) {
                leavingUser = user;
                break;
            }
            leavingUserIdx++;
        }

        socket.to(userRoom(socket.id)).emit('leave', {
            username: leavingUser.username
        });

        roomsInfo[userRoom(socket.id)].users.splice(leavingUserIdx, 1);
        //delete roomsInfo[userRoom(socket.id)].users[socket.id];
    });
});

addRoomTurnCallback((roomId) => {
    io.in(roomId).emit('turnUpdate', roomsInfo[roomId]);
});

http.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
});

module.exports = {
    http
};