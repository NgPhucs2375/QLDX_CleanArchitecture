import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
// import "./styles/global.css"; // (Tùy chọn) Bổ sung file CSS global để fix các style mặc định

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);