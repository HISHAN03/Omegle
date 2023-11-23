import { useEffect, useRef, useState } from "react";
import "./App.css";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import cameraIcon from "../icons/camera.png";
import micIcon from "../icons/mic.png";
import phoneIcon from "../icons/phone.png";

function App() {
  let peer;
  let roomid;
  let type;
  let remoteSocket;
  const navigate = useNavigate();
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [socket, setSocket] = useState(io("http://localhost:8000"));
  const myVideoRef = useRef(null);
  const strangerVideoRef = useRef(null);
  const [spinnerVisible, setSpinnerVisible] = useState(true);
  const toggleAudio = () => {
    const localStream = myVideoRef.current.srcObject;
    const audioTracks = localStream.getAudioTracks();
    audioTracks.forEach((track) => {
      track.enabled = !track.enabled;
      setIsAudioMuted(!track.enabled);
    });
  };

  const toggleVideo = () => {
    const localStream = myVideoRef.current.srcObject;
    const videoTracks = localStream.getVideoTracks();

    videoTracks.forEach((track) => {
      track.enabled = !track.enabled;
      setIsVideoMuted(!track.enabled);
    });
  };
  const servers = {
    iceServers: [
      {
        urls: ["stun:stun.arbuz.ru:3478", "stun:stun.bahnhof.net:3478"],
      },
    ],
  };

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
    peer = new RTCPeerConnection(servers);
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

  const leaveRoom = () => {
    console.log("function reached here leave room");
    socket.emit("leave");
    navigate("/");
    window.location.reload(true);
  };

  socket.on("disconnected", () => {
    peer.close();
    console.log("disconnected");
    navigate("/");
    socket.emit("leave");
  });

  return (
    <>
      {spinnerVisible && (
        <div className="modal">
          <div class="custom-loader"></div>
          <span id="spinner">Waiting For Someone...</span>
        </div>
      )}
      <div className="video-holder">
        <video autoPlay ref={myVideoRef} id="my-video"></video>
        <video autoPlay ref={strangerVideoRef} id="video"></video>

        <div id="controls">
          <div
            className="control-container"
            id="camera-btn"
            onClick={toggleVideo}
          >
            <img src={cameraIcon} alt="Camera" />
          </div>

          <div className="control-container" id="mic-btn" onClick={toggleAudio}>
            <img src={micIcon} alt="Microphone" />
          </div>

          <div
            className="control-container"
            id="leave-btn"
            onClick={() => leaveRoom()}
          >
            <img src={phoneIcon} alt="Phone" />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
