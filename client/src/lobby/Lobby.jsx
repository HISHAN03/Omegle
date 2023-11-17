import React from "react";
import "./Lobby.css"
import cover from "../icons/logo.jpg"
import { useNavigate } from "react-router-dom";

export default function Lobby() {
  const navigate = useNavigate();

  function redirect() {
    // Use navigate to redirect to the "/home" route
    navigate("/home");
  }

  return (
    <>
      <div className="wrapper"> 
      <img className="wrapperimg" src={cover} alt="Microphone" />
        <button onClick={redirect}>Start</button>
      </div>
    </>
  );
}
