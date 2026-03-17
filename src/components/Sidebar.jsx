// =============================
// Sidebar.jsx
// =============================
import { Plus, Trash2 } from "lucide-react";

export default function Sidebar({ chats, newChat, setCurrentChatId, deleteChat }) {
  return (
    <div className="w-64 bg-[#171717] border-r border-white/5 p-4 flex flex-col">

      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">L</div>
        <span className="font-semibold">My Logo</span>
      </div>

      <button
        onClick={newChat}
        className="bg-[#2a2a2a] hover:bg-[#3a3a3a] p-3 rounded-xl flex gap-2"
      >
        <span className="text-lg leading-none">+</span>
        <span className="text-sm">New Chat</span>
      </button>

      <div className="mt-6 text-sm text-gray-400">Recent Chats</div>

      <div className="mt-2 space-y-2">
        {chats.map(chat => (
          <div
            key={chat.id}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-[#2a2a2a] group"
          >
            <div
              onClick={() => setCurrentChatId(chat.id)}
              className="cursor-pointer text-sm truncate"
            >
              {chat.title}
            </div>

            <button
              onClick={() => deleteChat(chat.id)}
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
