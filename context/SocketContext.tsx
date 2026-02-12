"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[]; // List of userIds (or socketIds in simple case, but we mapped userId)
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: [],
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  useEffect(() => {
    if (user && user.status === 'approved' && !socketRef.current) {
      // Connect to the same host
      const newSocket = io({
        path: "/socket.io", // Standard path, can be customized
      });

      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
        setIsSocketConnected(true);
        // Identify self
        newSocket.emit("identify", user._id);
      });

      newSocket.on("online-users-list", (users: string[]) => {
        setOnlineUsers(users);
      });

      newSocket.on("user-online", (data: { userId: string }) => {
        setOnlineUsers((prev) => Array.from(new Set([...prev, data.userId])));
      });

      newSocket.on("user-offline", (data: { userId: string }) => {
        setOnlineUsers((prev) => prev.filter((id) => id !== data.userId));
      });

      socketRef.current = newSocket;

      // Cleanup
      return () => {
        newSocket.disconnect();
        socketRef.current = null;
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
