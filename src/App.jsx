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
    <div className="flex h-screen overflow-hidden bg-[#212121] text-white relative">
      {sidebarOpen && (
        <Sidebar
          chats={chats}
          newChat={newChat}
          setCurrentChatId={setCurrentChatId}
          deleteChat={deleteChat}
        />
      )}

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`
          fixed top-4 z-50
          h-11 w-11 overflow-hidden rounded-full
          shadow-lg transition-all duration-300
          ${sidebarOpen ? "left-72" : "left-4"}
        `}
      >
        <img
          src={sidebarImage}
          alt="Toggle sidebar"
          className="h-full w-full rounded-full object-cover"
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
