import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const serverUrl = import.meta.env.VITE_SERVER_URL;

    if (!serverUrl) {
      console.warn('⚠️ VITE_SERVER_URL is not set! Falling back to localhost:5000 (for dev only).');
    }

    const newSocket = io(serverUrl || 'http://localhost:5000', {
      withCredentials: true,
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
