// =============================
// Sidebar.jsx
// =============================
import { Plus, Trash2 } from "lucide-react";
import logoImage from "../assets/mc_logo.jpeg";

export default function Sidebar({ chats, newChat, setCurrentChatId, deleteChat, currentChatId }) {
  return (
    <div className="w-64 bg-[#171717] border-r border-white/5 p-4 flex flex-col">

      <div className="mb-6 flex items-center gap-3">
        <img
          src={logoImage}
          alt="Mclovin logo"
          className="h-10 w-10 rounded-full object-cover"
        />
        <span className="text-lg font-semibold">Mclovin</span>
      </div>

      <button
        onClick={newChat}
        className="bg-[#2a2a2a] hover:bg-[#3a3a3a] p-3 rounded-xl flex gap-2"
      >
        <span className="text-lg leading-none">+</span>
        <span className="text-sm">New Chat</span>
      </button>

      <div className="mt-6 text-sm text-gray-400">Recent Chats</div>

      <div className="mt-2 flex-1 space-y-2 overflow-y-auto">
        {chats.map(chat => (
          <div
            key={chat.id}
            className={`group flex items-center justify-between rounded-lg p-2 transition ${
              currentChatId === chat.id ? "bg-[#2f2f31]" : "hover:bg-[#2a2a2a]"
            }`}
          >
            <div
              onClick={() => setCurrentChatId(chat.id)}
              className="min-w-0 flex-1 cursor-pointer text-sm truncate"
            >
              {chat.title}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteChat(chat.id);
              }}
              className="opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-red-400"
            >
              <Trash2 size={14}/>
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
