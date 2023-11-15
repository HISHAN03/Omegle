const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const app = express();
const server = http.createServer(app);
const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
};
let online= 0;
let roomArr = [];


const io = socketIO(server, {
  cors: corsOptions,
});



io.on("connection", (socket) => {

    online++;
  

  console.log(`A user connected with id ${socket.id}`);

  socket.on('start', cb => {
    handelStart(roomArr, socket, cb, io);
  })
  



});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});