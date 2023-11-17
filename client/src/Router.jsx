import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./app/App"
import Lobby from "./lobby/Lobby"

export default function Router() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Lobby />} />
      <Route path="/home" element={<App />} />
    </Routes>
  </BrowserRouter>
  );
}

