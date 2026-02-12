"use client";
import React, { createContext, useContext, useState } from "react";

interface CallContextType {
  callUser: (userId: string, userName: string, userAvatar?: string) => void;
  // State meant to be consumed by CallManager
  outgoingCallData: { userId: string; userName: string; userAvatar?: string } | null;
  setOutgoingCallData: (data: { userId: string; userName: string; userAvatar?: string } | null) => void;
}

const CallContext = createContext<CallContextType>({
  callUser: () => {},
  outgoingCallData: null,
  setOutgoingCallData: () => {},
});

export const CallProvider = ({ children }: { children: React.ReactNode }) => {
  const [outgoingCallData, setOutgoingCallData] = useState<{ userId: string; userName: string; userAvatar?: string } | null>(null);

  const callUser = (userId: string, userName: string, userAvatar?: string) => {
    setOutgoingCallData({ userId, userName, userAvatar });
  };

  return (
    <CallContext.Provider value={{ callUser, outgoingCallData, setOutgoingCallData }}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);
