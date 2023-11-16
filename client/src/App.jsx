import { useEffect, useRef, useState } from "react";
import "./App.css";
import { io } from "socket.io-client";

function App() {
  let peer;
  let roomid;
  let type;
  let remoteSocket;
  const [socket, setSocket] = useState(io("http://localhost:8000"));
  const myVideoRef = useRef(null);
  const strangerVideoRef = useRef(null);
  const [spinnerVisible, setSpinnerVisible] = useState(true);

  function start() {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        if (peer) {
          myVideoRef.current.srcObject = stream;
          stream.getTracks().forEach((track) => peer.addTrack(track, stream));

          peer.ontrack = (e) => {
            strangerVideoRef.current.srcObject = e.streams[0];
            strangerVideoRef.current.play();
          };
        }
      })
      .catch((ex) => {
        console.log(ex);
      });
  }

  useEffect(() => {
    socket.emit("start", (person) => {
      type = person;
      console.log(type);
    });
  }, []);

  socket.on("roomid", (id) => {
    roomid = id;
    console.log(roomid);
  });

  socket.on("remote-socket", (id) => {
    remoteSocket = id;
    console.log("remote id" + remoteSocket);
    setSpinnerVisible(false);
    peer = new RTCPeerConnection();
    peer.onnegotiationneeded = async (e) => {
      if (peer) {
        webrtc();
      }
    };

    peer.onicecandidate = async (e) => {
      if (peer) {
        socket.emit("ice:send", { candidate: e.candidate, to: remoteSocket });
      }
    };
    start();
  });

  async function webrtc() {
    if (type == "p1") {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socket.emit("sdp:send", { sdp: peer.localDescription });
      console.log("offer created,set and sent to server");
    }
  }


  socket.on("sdp:reply", async ({ sdp, from }) => {
    if (peer) {
      await peer.setRemoteDescription(new RTCSessionDescription(sdp));
      if (type == "p2") {
        const ans = await peer.createAnswer();
        await peer.setLocalDescription(ans);
        socket.emit("sdp:send", { sdp: peer.localDescription });
        console.log("offer set as remotes desc and answer created and sent ");
      }
    }
  });

  socket.on("ice:reply", async ({ candidate, from }) => {
    if (peer) {
      await peer.addIceCandidate(candidate);
    }
  });

  socket.on('disconnected', () => {
   console.log('disconnected')
  })

  return (
    <>
      {spinnerVisible && (
        <div className="modal">
          <span id="spinner">Waiting For Someone...</span>
        </div>
      )}
      <div className="video-holder">
        <video autoPlay ref={myVideoRef} id="my-video"></video>
        <video autoPlay ref={strangerVideoRef} id="video"></video>
      </div>
    </>
  );
}

export default App;
