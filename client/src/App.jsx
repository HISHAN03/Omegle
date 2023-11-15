import { useEffect, useRef } from "react";
import "./App.css";
import { io } from "socket.io-client";

function App() {
  const myVideoRef = useRef(null);
  const strangerVideoRef = useRef(null);

  const socket = io('http://localhost:8000');

  // socket.emit('start', (person) => {
  //   type = person;
  // });

 


  const peer = new RTCPeerConnection();
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
    start();

    socket.emit('start', (person) => {
      type = person;
    });

  }, []);

  return (
    <>
      <div className="video-holder">
        <video autoPlay ref={myVideoRef} id="my-video"></video>
        <video autoPlay ref={strangerVideoRef} id="video"></video>
      </div>
    </>
  );
}

export default App;
