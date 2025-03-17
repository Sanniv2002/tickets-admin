import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const base_url = import.meta.env.VITE_NOTIF_BASE_URL || ""
const ws = new WebSocket(base_url);

ws.onopen = () => {
  console.log("connection opened")
};

ws.onclose = () => {
  console.log("closed")
  setTimeout(() => {
    window.location.reload();
  }, 5000);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App websocket={ws} />
  </StrictMode>
);