const { WORD_LIST } = require('./config.js');

/*
    <id>: {
        users: [{
            username: params.username,
            points: 0,
            rank: 1,
            isDrawing: false,
            socketId: params.socketId,
        }],
        round:,
        drawingUser:,
        word:,
        totalRounds:,
        turnTime:,
    }
*/
const roomsInfo = {};
const onRoomTurn = { callbacks: [] };

function moveRoomTurn(roomId) {
    //new round
    const room = roomsInfo[roomId];

    if (room.drawingUser != -1) {
        room.users[room.drawingUser].isDrawing = false;
    }

    if (room.drawingUser === room.users.length - 1) {
        room.round++;
        room.drawingUser = 0;
    } else {
        room.drawingUser++;
    }

    if (room.round > room.totalRounds) {
        //finishRoom
        return false;
    }

    //console.log('New drawing user is ', room.drawingUser , ' for round ', room.round);
    room.users[room.drawingUser].isDrawing = true;
    room.word = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];

    for (const user of room.users) {
        user.guessed = false;
    }

    for (const cb of onRoomTurn.callbacks) {
        cb(roomId);
    }

    return true;
}

function createRoom(params) {
    //assert defined roomId

    if (roomsInfo[params.roomId] != undefined) {
        return;
    }

    roomsInfo[params.roomId] = {
        users: [],
        round: 0,
        drawingUser: -1,
        word: '',
        totalRounds: params.totalRounds || 3,
        turnTime: params.turnTime || 120 * 1000,
    };
}

function startRoom(roomId) {
    const interval = setInterval(() => {
        if(! moveRoomTurn(roomId)) {
            console.log('clearing ');
            clearInterval(interval);
        }
    }, roomsInfo[roomId].turnTime);
    moveRoomTurn(roomId);
}

function addUserToRoom(params) {
    if (roomsInfo[params.roomId] == undefined) {
        createRoom(params);
    }

    //roomsInfo[params.roomId] ||= { users: {}, round: 0, word: '' };
    roomsInfo[params.roomId].users.push({
        username: params.username,
        points: 0,
        rank: 1,
        isDrawing: false,
        socketId: params.socketId,
    });
}

function addRoomTurnCallback(cb) {
    onRoomTurn.callbacks.push(cb);
}

function getUserInfo(roomId, socketId) {
    for (const user of roomsInfo[roomId].users) {
        if (user.socketId == socketId) {
            return user;
        }
    }
}

module.exports = {
    roomsInfo,
    startRoom,
    createRoom,
    addUserToRoom,
    addRoomTurnCallback,
    getUserInfo
};