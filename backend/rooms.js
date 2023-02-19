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

  console.log(room.drawingUser);
  if (room.drawingUser != -1 && room.drawingUser < room.users.length) {
    room.users[room.drawingUser].isDrawing = false;
  }

  console.log('TT:', room.drawingUser, room.users.length);
  if (room.drawingUser >= room.users.length - 1) {
    room.round++;
    room.drawingUser = 0;
  } else {
    room.drawingUser++;
  }

  if (room.round >= room.totalRounds) {
    //finishRoom
    room.drawingUser = -1;
    return true;
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
  room.time = room.turnTime;
  room.drawingPath = [];

  for (const user of room.users) {
    user.guessed = false;
  }

  for (const cb of onRoomTurn.callbacks) {
    cb(roomId);
  }

  return false;
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
    totalRounds: params.totalRounds || 1,
    turnTime: params.turnTime || 120,
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

function delay(roomId, seconds) {
  const room = roomsInfo[roomId];

  return new Promise((resolve, reject) => {
    setInterval(() => {
      room.time -= 1;

      if (room.time === 0) {
        resolve()
      }
    }, 1000);
  });
}

function waitForCompleted(roomId) {
  const room = roomsInfo[roomId];

  return new Promise((resolve, reject) => {
    setInterval(() => {
      if (room.guessedUsers.length === room.users.length - 1) {
        resolve(); // all users have guessed
      } else if (
        room.drawingUser == -1 || 
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
    const gameEnded = moveRoomTurn(roomId);

    if (gameEnded) {
      const finalInfo = roomsInfo[roomId];
      delete roomsInfo[roomId];
      return finalInfo;
    }

    await Promise.any([
      delay(roomId, roomsInfo[roomId].turnTime),
      waitForCompleted(roomId),
    ]);

    if (roomsInfo[roomId].users.length === 0) {
      break;
    }
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

  return params.username;
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
