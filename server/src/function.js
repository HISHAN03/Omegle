const { v4: uuidv4 } = require("uuid");

function handelStart(roomArry, socket, cb, io) {
  let availableroom = checkAvailableRoom();
  if (availableroom.is) {
    socket.join(availableroom.roomid);
    cb("p2");
    closeRoom(availableroom.roomid);
    if (availableroom && availableroom.room) {
      io.to(availableroom.room.p1.id).emit("remote-socket", socket.id);
      socket.emit("remote-socket", availableroom.room.p1.id);
      socket.emit("roomid", availableroom.room.roomid);
      console.log("room available ");
    }
  } else {
    let roomid = uuidv4();
    socket.join(roomid);
    roomArry.push({
      roomid,
      isAvailable: true,
      p1: {
        id: socket.id,
      },
      p2: {
        id: null,
      },
    });
    cb("p1");
    socket.emit("roomid", roomid);
    console.log("created new room");
  }

  function closeRoom(roomid) {
    for (let i = 0; i < roomArry.length; i++) {
      if (roomArry[i].roomid == roomid) {
        roomArry[i].isAvailable = false;
        roomArry[i].p2.id = socket.id;
        break;
      }
    }
  }

  function checkAvailableRoom() {
    for (i = 0; i < roomArry.length; i++) {
      if (roomArry[i].isAvailable) {
        return { is: true, roomid: roomArry[i].roomid, room: roomArry[i] };
      }
      if (roomArry[i].p1.id == socket.id || roomArry[i].p2.id == socket.id) {
        return { is: false, roomid: "", room: null };
      }
    }
    return { is: false, roomid: "", room: null };
  }
}
function getType(id, roomArr) {
  for (let i = 0; i < roomArr.length; i++) {
    if (roomArr[i].p1.id == id) {
      return { type: "p1", p2id: roomArr[i].p2.id };
    } else if (roomArr[i].p2.id == id) {
      return { type: "p2", p1id: roomArr[i].p1.id };
    }
  }

  return false;
}

function handelDisconnect(disconnectedId, roomArr, io) {
  for (let i = 0; i < roomArr.length; i++) {
    if (roomArr[i].p1.id == disconnectedId) {
      io.to(roomArr[i].p2.id).emit("disconnected");
      if (roomArr[i].p2.id) {
        roomArr[i].isAvailable = true;
        roomArr[i].p1.id = roomArr[i].p2.id;
        roomArr[i].p2.id = null;
      } else {
        roomArr.splice(i, 1);
      }
    } else if (roomArr[i].p2.id == disconnectedId) {
      io.to(roomArr[i].p1.id).emit("disconnected");
      if (roomArr[i].p1.id) {
        roomArr[i].isAvailable = true;
        roomArr[i].p2.id = null;
      } else {
        roomArr.splice(i, 1);
      }
    }
  }
}

module.exports = {
  handelStart,
  getType,
  handelDisconnect,
};
