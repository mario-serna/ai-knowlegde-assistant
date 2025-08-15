import { ChatMessage, Session } from "@/types";
import React from "react";

interface SessionContextType {
  activeSessionId: string;
  sessions: Session[];
  messages: ChatMessage[];
  setActiveSessionId: React.Dispatch<React.SetStateAction<string>>;
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  addMessage: (message: ChatMessage) => void;
  addSession: (session: Session) => void;
}

export const SessionContext = React.createContext<SessionContextType>({
  activeSessionId: "",
  sessions: [],
  messages: [],
  setActiveSessionId: () => {},
  setSessions: () => {},
  setMessages: () => {},
  addMessage: () => {},
  addSession: () => {},
});

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [activeSessionId, setActiveSessionId] = React.useState<string>("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [sessions, setSessions] = React.useState<Session[]>([]);

  const addMessage = (message: ChatMessage) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const addSession = (session: Session) => {
    setSessions((prevSessions) => [session, ...prevSessions]);
  };

  return (
    <SessionContext.Provider
      value={{
        activeSessionId,
        sessions,
        messages,
        setActiveSessionId,
        setSessions,
        setMessages,
        addMessage,
        addSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = React.useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider.");
  }
  return context;
};
