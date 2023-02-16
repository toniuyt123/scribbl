const { WORD_LIST } = require('./config.js');

const roomInfo = {};

function moveRoomTurn(roomId) {
    const usersInfo = roomInfo[roomId].users;
    let lastDrawingPlayer = roomInfo[roomId]
}

function startRoom(roomId) {
    // let lastDrawingPlayer = 0;
    // roomInfo[roomId].round = 1;
    // roomInfo[roomId].users[0].isDrawing = true;
    // roomInfo[roomId].word = WORD_LIST[Math.random];

    // setTimeout(() => {
    //     lastDrawingPlayer = 
    // }, 120000)

}

module.exports = {
    roomInfo,
};