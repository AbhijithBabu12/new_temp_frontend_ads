import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";

export default function App() {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [mode, setMode] = useState("chat");
  const [sidebarOpen, setSidebarOpen] = useState(true); // ✅ NEW

  // ✅ Create default chat on load
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

  // ✅ NEW CHAT
  const newChat = () => {
    const chat = {
      id: Date.now().toString(),
      title: mode === "chat" ? "Chat" : "Data Analysis",
      messages: [],
      mode: mode
    };

    setChats(prev => [chat, ...prev]);
    setCurrentChatId(chat.id);
  };

  // ✅ MODE SWITCH
  const switchMode = (newMode) => {
    const chat = {
      id: Date.now().toString(),
      title: newMode === "chat" ? "Chat" : "Data Analysis",
      messages: [],
      mode: newMode
    };

    setMode(newMode);
    setChats(prev => [chat, ...prev]);
    setCurrentChatId(chat.id);
  };

  // ✅ DELETE CHAT (NEW)
  const deleteChat = (chatId) => {
    const filtered = chats.filter(c => c.id !== chatId);

    if (filtered.length === 0) {
      // create fresh chat if all deleted
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

  // ✅ UPDATE MESSAGES + AUTO TITLE
  const updateMessages = (chatId, messages) => {
    setChats(prev =>
      prev.map(c => {
        if (c.id !== chatId) return c;

        let title = c.title;

        if (messages.length > 0 && c.title === "Chat") {
          title = messages[0].content.slice(0, 25);
        }

        return { ...c, messages, title };
      })
    );
  };

  const currentChat = chats.find(c => c.id === currentChatId);

  return (
    <div className="flex h-screen bg-[#212121] text-white relative">

      {/* ✅ SIDEBAR */}
      {sidebarOpen && (
        <Sidebar
          chats={chats}
          newChat={newChat}
          setCurrentChatId={setCurrentChatId}
          deleteChat={deleteChat} // 🔥 new
        />
      )}

      {/* ✅ TOGGLE BUTTON */}
      <button
  onClick={() => setSidebarOpen(!sidebarOpen)}
  className={`
    fixed top-4 z-50
    w-10 h-10 rounded-full
    bg-blue-600 flex items-center justify-center
    shadow-lg hover:bg-blue-500 transition-all duration-300
    ${sidebarOpen ? "left-64" : "left-4"}
  `}
>
  ☰
</button>
      <ChatWindow
        chat={currentChat}
        updateMessages={updateMessages}
        switchMode={switchMode}
      />
    </div>
  );
}