const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const app = express();
const server = http.createServer(app);
const { handelStart, getType,handelDisconnect} = require("./function");

const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
};
let online = 0;
let roomArr = [];

const io = socketIO(server, {
  cors: corsOptions,
});

io.on("connection", (socket) => {
  online++;

  console.log(`A user connected with id ${socket.id}`);

  socket.on("start", (cb) => {
    handelStart(roomArr, socket, cb, io);
  });

  socket.on("ice:send", ({ candidate }) => {
    let type = getType(socket.id, roomArr);
    if (type.type) {
      if (type == "p1") {
        io.to(type.p2id).emit("ice:reply", { candidate, from: socket.id });
      } else if (type?.type == "p2") {
        io.to(type.p1id).emit("ice:reply", { candidate, from: socket.id });
      }
    }
  });


  socket.on('sdp:send', ({ sdp }) => {
    let type = getType(socket.id, roomArr);
    if (type) {
      if (type.type == 'p1') {
        io.to(type.p2id).emit('sdp:reply', { sdp, from: socket.id });
      }
      if (type.type == 'p2') {
        io.to(type.p1id).emit('sdp:reply', { sdp, from: socket.id });
      }
    }
  })












  socket.on('disconnect', () => {
    online--;
    io.emit('online', online);
    console.log(online)
    handelDisconnect(socket.id, roomArr, io);
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
