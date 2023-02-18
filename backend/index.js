const path = require("path");
const cors = require("cors");
const express = require("express");

const app = express();
const port = 3000;

const http = require("http").Server(app);

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
//io.set('log level', 1);

const {
  addRoomTurnCallback,
  addUserToRoom,
  startRoom,
  roomsInfo,
  getUserInfo,
  getRandomPublicRoom,
  createRoom,
  censorWord,
} = require("./rooms.js");

app.get("/users/:roomId", (req, res) => {
  if (roomsInfo[req.params.roomId] == undefined) {
    return res.send([]);
  }

  return res.send(roomsInfo[req.params.roomId].users);
});

app.get("/rooms/:roomId", (req, res) => {
  if (roomsInfo[req.params.roomId] == undefined) {
    return res.send({});
  }

  return res.send(roomsInfo[req.params.roomId]);
});

const io = require("socket.io")(http);

const rooms = io.of("/").adapter.rooms;
const sids = io.of("/").adapter.sids;

function userRoom(id) {
  return Array.from(sids.get(id))[1];
}

io.on("connection", (socket) => {
  console.log("conenction ", socket.id);

  socket.on("join", (data, callback) => {
    if (data.roomId == undefined) {
      data.roomId = socket.id;
    } else {
      socket.join(data.roomId);
    }

    //ASSERT(rooms[room].length < 8)

    data.socketId = socket.id;
    addUserToRoom(data);

    io.in(userRoom(socket.id)).emit("joined", {
      username: data.username,
    });

    const word = roomsInfo[userRoom(socket.id)].word;
    roomsInfo[userRoom(socket.id)].word = censorWord(word);
    callback(roomsInfo[userRoom(socket.id)]);
    roomsInfo[userRoom(socket.id)].word = word;
  });

  socket.on("mousemove", (data) => {
    const room = roomsInfo[userRoom(socket.id)];

    if (room.users[room.drawingUser].socketId !== socket.id) {
      return;
    }

    room.drawingPath.push(data);

    socket.to(userRoom(socket.id)).emit("drawing", data);
  });

  socket.on("msg", (data) => {
    const correctWord = roomsInfo[userRoom(socket.id)].word;
    const user = getUserInfo(userRoom(socket.id), socket.id);

    if (user.guessed) {
      //send to hidden chat
      return;
    }

    if (data.content == correctWord) {
      user.points +=
        100 / (roomsInfo[userRoom(socket.id)].guessedUsers.length + 1);
      user.guessed = true;

      io.in(userRoom(socket.id)).emit("guessed", user);
      roomsInfo[userRoom(socket.id)].guessedUsers.push(socket.id);

      return;
    }

    io.in(userRoom(socket.id)).emit("msg", data);
  });

  socket.on("startRoom", async (data) => {
    const finalInfo = await startRoom(userRoom(socket.id));

    io.in(finalInfo.roomId).emit("endRoom", finalInfo);
  });

  socket.on("disconnecting", (reason) => {
    if (roomsInfo[userRoom(socket.id)] == undefined) {
      return;
    }

    let leavingUser;
    let leavingUserIdx = 0;
    for (const user of roomsInfo[userRoom(socket.id)].users) {
      if (user.socketId == socket.id) {
        leavingUser = user;
        break;
      }
      leavingUserIdx++;
    }

    socket.to(userRoom(socket.id)).emit("leave", {
      username: leavingUser.username,
    });

    roomsInfo[userRoom(socket.id)].users.splice(leavingUserIdx, 1);
  });

  socket.on("getRandomPublicRoom", (data, callback) => {
    callback(getRandomPublicRoom());
  });

  socket.on("createPrivateRoom", (data, callback) => {
    const roomInfo = createRoom({ isPrivate: true });
    callback(roomInfo);
  });
});

addRoomTurnCallback((roomId) => {
  const room = roomsInfo[roomId];
  const word = room.word;
  
  room.word = censorWord(word);
  
  const socket = io.of('/').sockets.get(room.users[room.drawingUser].socketId);

  socket.to(roomId).emit("turnUpdate", room);
  room.word = word;
  io.to(socket.id).emit("turnUpdate", room);
});

http.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

module.exports = {
  http,
};
