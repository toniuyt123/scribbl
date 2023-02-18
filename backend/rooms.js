const { WORD_LIST } = require("./config.js");

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

  if (room.drawingUser != -1 && room.drawingUser < room.users.length) {
    room.users[room.drawingUser].isDrawing = false;
  }

  if (room.drawingUser >= room.users.length - 1) {
    room.round++;
    room.drawingUser = 0;
  } else {
    room.drawingUser++;
  }

  if (room.round > room.totalRounds) {
    //finishRoom
    return false;
  }

  console.log(
    "New drawing user is ",
    room.drawingUser,
    " for users length ",
    room.users.length
  );
  room.users[room.drawingUser].isDrawing = true;
  room.guessedUsers = [];
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
  const roomId = params.roomId || randomId();

  if (roomsInfo[params.roomId] != undefined) {
    return;
  }

  return (roomsInfo[roomId] = {
    users: [],
    guessedUsers: [],
    round: 0,
    drawingUser: -1,
    word: "",
    totalRounds: params.totalRounds || 3,
    turnTime: params.turnTime || 120 * 1000,
    drawingPath: [],
    isPrivate: params.isPrivate || false,
    roomId,
  });
}

function randomId() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function getRandomPublicRoom() {
  for (const roomId in roomsInfo) {
    if (!roomsInfo[roomId].isPrivate) {
      return roomsInfo[roomId];
    }
  }

  return createRoom({ roomId: randomId() });
}

function delay(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });
}

function waitForCompleted(roomId) {
  const room = roomsInfo[roomId];

  return new Promise((resolve, reject) => {
    setInterval(() => {
      if (room.guessedUsers.length === room.users.length - 1) {
        resolve(); // all users have guessed
      } else if (
        room.drawingUser >= room.users.length ||
        !room.users[room.drawingUser].isDrawing
      ) {
        resolve(); // user left
      }
    }, 100);
  });
}

async function startRoom(roomId) {
  while (true) {
    moveRoomTurn(roomId);

    await Promise.any([
      delay(roomsInfo[roomId].turnTime),
      waitForCompleted(roomId),
    ]);
  }

}

function addUserToRoom(params) {
  if (roomsInfo[params.roomId] == undefined) {
    createRoom(params);
  }

  if (!params.username) {
    const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    params.username = randomWord[0].toUpperCase() + randomWord.slice(1);
  }

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

function censorWord(word) {
  return word.replaceAll(/\w/g, '_ ');
}

module.exports = {
  roomsInfo,
  startRoom,
  createRoom,
  addUserToRoom,
  addRoomTurnCallback,
  getUserInfo,
  getRandomPublicRoom,
  censorWord,
};
