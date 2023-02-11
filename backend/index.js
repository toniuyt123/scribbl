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
    return Array.from(sids.get(socket.id))[0];
}

io.on('connection', (socket) => {
    socket.on('join', (room) => {
        if (room == undefined) {
            // const roomId = (new Date()).getTime();
            // socket.join(roomId);
            // console.log('Joinned', roomId);

            return;
        }

        //ASSERT(rooms[room].length < 8)
        socket.join(room);
        socket.leave(socket.id);
        console.log('Joinned', room);
    });

    socket.on('mousemove', (data) => {
        //console.log(sids, socket.id);
        socket.to(userRoom(socketId)).emit('drawing', data);
    });
});

http.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
 });