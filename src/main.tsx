import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const base_url = import.meta.env.VITE_NOTIF_BASE_URL || "";

let ws: WebSocket | null = null;
let reconnectInterval = 1000;
const maxReconnectInterval = 30000;

const connectWebSocket = () => {
  ws = new WebSocket(base_url);

  ws.onopen = () => {
    reconnectInterval = 1000;
  };

  ws.onclose = () => {
    setTimeout(connectWebSocket, reconnectInterval);
    reconnectInterval = Math.min(reconnectInterval * 2, maxReconnectInterval);
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
};

connectWebSocket();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {ws && <App websocket={ws} />}
  </StrictMode>
);
