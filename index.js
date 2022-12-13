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

app.get('/', function(req, res) {
    res.sendfile('drawing.html');
 }); 


io.on('connection', function (socket) {
    socket.on('mousemove', function (data) {
        socket.broadcast.emit('drawing', data);
    });
});

http.listen(port, function() {
    console.log(`Example app listening on port ${port}!`);
 });