import {Room} from "./obj"

export default function handelStart(roomArry,socket,cb,io)
{
    let availableroom = checkAvailableRoom();
    if (availableroom.is) {
        socket.join(availableroom.roomid);
        cb('p2');
        closeRoom(availableroom.roomid);
        if (availableroom && availableroom.room) {
          io.to(availableroom.room.p1.id).emit('remote-socket', socket.id);
          socket.emit('remote-socket', availableroom.room.p1.id);
          socket.emit('roomid', availableroom.room.roomid);
        }
      }

      else {
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
          }
        });
        cb('p1');
        socket.emit('roomid', roomid);
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






    function checkAvailableRoom()
    {
        for(i=0;i<roomArry.length;i++)
        {

            const roomInstance = new Room(
                roomArry[i].roomid,
                roomArry[i].isAvailable,
                roomArry[i].p1,
                roomArry[i].p2
              );

            if([i].isAvailable  )
            {
                return { is: true, roomid: roomInstance[i].roomid, room: roomInstance[i] };

            }
            if (roomInstance[i].p1.id == socket.id || roomInstance[i].p2.id == socket.id) 
            {
                return { is: false, roomid: "", room: null };
              }
              return { is: false, roomid: '', room: null };
        }
    }
}