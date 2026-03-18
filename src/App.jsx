import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import sidebarImage from "./assets/sidebar.jpeg";

export default function App() {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [mode, setMode] = useState("chat");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const firstChat = {
      id: Date.now().toString(),
      title: "Chat",
      messages: [],
      mode: "chat"
    };
    setChats([firstChat]);
    setCurrentChatId(firstChat.id);
  }, []);

  const newChat = () => {
    const chat = {
      id: Date.now().toString(),
      title: mode === "chat" ? "Chat" : "Data Analysis",
      messages: [],
      mode
    };

    setChats((prev) => [chat, ...prev]);
    setCurrentChatId(chat.id);
  };

  const switchMode = (newMode) => {
    const chat = {
      id: Date.now().toString(),
      title: newMode === "chat" ? "Chat" : "Data Analysis",
      messages: [],
      mode: newMode
    };

    setMode(newMode);
    setChats((prev) => [chat, ...prev]);
    setCurrentChatId(chat.id);
  };

  const deleteChat = (chatId) => {
    const filtered = chats.filter((c) => c.id !== chatId);

    if (filtered.length === 0) {
      const newChatObj = {
        id: Date.now().toString(),
        title: "Chat",
        messages: [],
        mode: "chat"
      };
      setChats([newChatObj]);
      setCurrentChatId(newChatObj.id);
    } else {
      setChats(filtered);
      setCurrentChatId(filtered[0].id);
    }
  };

  const updateMessages = (chatId, messages) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;

        let title = c.title;

        if (messages.length > 0 && c.title === "Chat") {
          title = messages[0].content.slice(0, 25);
        }

        return { ...c, messages, title };
      })
    );
  };

  const currentChat = chats.find((c) => c.id === currentChatId);

  return (
    <div className="app-shell relative flex h-screen overflow-hidden bg-[#171514] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(214,185,142,0.14),transparent_26%),radial-gradient(circle_at_78%_18%,rgba(120,102,83,0.12),transparent_22%),linear-gradient(180deg,#1a1716_0%,#111010_100%)]"></div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[26rem] bg-[radial-gradient(circle_at_left,rgba(255,255,255,0.025),transparent_58%)]"></div>

      {sidebarOpen && (
        <Sidebar
          chats={chats}
          newChat={newChat}
          setCurrentChatId={setCurrentChatId}
          deleteChat={deleteChat}
          currentChatId={currentChatId}
        />
      )}

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`
          fixed top-5 z-50
          flex h-12 w-12 items-center justify-center overflow-hidden rounded-full
          border border-[#6f665c]/25 bg-[linear-gradient(180deg,rgba(50,44,40,0.92),rgba(31,28,26,0.9))]
          shadow-[0_18px_50px_rgba(0,0,0,0.28)] transition-all duration-300
          backdrop-blur-xl
          ${sidebarOpen ? "left-80" : "left-4"}
        `}
      >
        <img
          src={sidebarImage}
          alt="Toggle sidebar"
          className="h-full w-full rounded-full object-cover opacity-80 saturate-50 brightness-90"
        />
      </button>

      <ChatWindow
        chat={currentChat}
        updateMessages={updateMessages}
        switchMode={switchMode}
      />
    </div>
  );
}
