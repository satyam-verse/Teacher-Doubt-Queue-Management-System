import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const host = typeof window !== 'undefined' ? (window.location.hostname || 'localhost') : 'localhost';
    const defaultBackend = `http://${host}:5000`;
    const backendUrl = import.meta.env.VITE_API_URL || defaultBackend;

    const token = typeof window !== 'undefined' ? localStorage.getItem('doubtx_token') : null;
    const s = io(backendUrl, {
      transports: ['polling', 'websocket'],
      auth: {
        token: token || '',
      },
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    s.on('connect', () => {
      console.log('⚡ Socket.IO connected successfully:', s.id);
      setIsConnected(true);
    });

    s.on('connect_error', (err) => {
      console.warn('Socket.IO connection attempt failed:', err.message);
      setIsConnected(false);
    });

    s.on('disconnect', (reason) => {
      console.log('⚡ Socket.IO disconnected:', reason);
      setIsConnected(false);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
