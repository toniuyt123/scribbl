const { WORD_LIST } = require('./config.js');

/*
    <id>: {
        users: [],
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
    if (roomsInfo[roomId].drawingUser != -1) {
        roomsInfo[roomId].users[roomsInfo[roomId].drawingUser].isDrawing = false;
    }

    if (roomsInfo[roomId].drawingUser === roomsInfo[roomId].users.length - 1) {
        roomsInfo[roomId].round++;
        roomsInfo[roomId].drawingUser = 0;
    } else {
        roomsInfo[roomId].drawingUser++;
    }

    if (roomsInfo.round > roomsInfo[roomId].totalRounds) {
        //finishRoom
        return false;
    }

    roomsInfo[roomId].users[roomsInfo[roomId].drawingUser].isDrawing = true;
    roomsInfo[roomId].word = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];

    for (const cb of onRoomTurn.callbacks) {
        cb(roomId);
    }
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
        turnTime: params.turnTime || 15 * 1000,
    };
}

function startRoom(roomId) {
    const interval = setInterval(() => {
        if(! moveRoomTurn(roomId)) {
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

module.exports = {
    roomsInfo,
    startRoom,
    createRoom,
    addUserToRoom,
    addRoomTurnCallback
};