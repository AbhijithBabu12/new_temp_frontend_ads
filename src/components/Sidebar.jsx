// =============================
// Sidebar.jsx
// =============================
import { Plus, Trash2 } from "lucide-react";
import logoImage from "../assets/mc_logo.jpeg";

export default function Sidebar({ chats, newChat, setCurrentChatId, deleteChat, currentChatId }) {
  return (
    <aside className="relative z-20 flex w-[18rem] shrink-0 flex-col bg-[linear-gradient(180deg,rgba(20,20,23,0.98)_0%,rgba(17,17,20,0.96)_100%)] px-4 py-5 shadow-[18px_0_60px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.05),transparent_32%)]"></div>

      <div className="relative mb-8 flex items-center gap-3">
        <img
          src={logoImage}
          alt="Mclovin logo"
          className="h-11 w-11 rounded-full object-cover ring-1 ring-white/10"
        />
        <div className="text-lg font-semibold tracking-[0.01em] text-white">Mclovin</div>
      </div>

      <button
        onClick={newChat}
        className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] px-4 py-3 text-left text-white transition duration-200 hover:border-white/16 hover:bg-white/[0.08]"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#eef2ff,#c7d2fe)] text-[#1f2937] shadow-[0_10px_24px_rgba(99,102,241,0.24)]">
          <Plus size={18} />
        </span>
        <span>
          <span className="block text-sm font-semibold">New Chat</span>
          <span className="block text-xs text-[#9aa0b1]">Start a fresh conversation</span>
        </span>
      </button>

      <div className="relative mt-8 flex items-center justify-between">
        <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#7f8596]">
          Recent Chats
        </div>
        <div className="h-px flex-1 bg-white/6 ml-3"></div>
      </div>

      <div className="relative mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
        {chats.map(chat => (
          <div
            key={chat.id}
            className={`group flex items-center justify-between rounded-2xl border px-3 py-3 transition ${
              currentChatId === chat.id
                ? "border-white/12 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-[0_10px_30px_rgba(0,0,0,0.16)]"
                : "border-transparent hover:border-white/8 hover:bg-white/[0.04]"
            }`}
          >
            <div
              onClick={() => setCurrentChatId(chat.id)}
              className="min-w-0 flex-1 cursor-pointer"
            >
              <div className="truncate text-sm font-medium text-[#eceef6]">{chat.title}</div>
              <div className="mt-1 truncate text-xs text-[#848a99]">
                {chat.mode === "data" ? "Data Science workspace" : "Conversation"}
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteChat(chat.id);
              }}
              className="ml-3 rounded-full p-2 text-gray-500 opacity-0 transition hover:bg-white/6 hover:text-red-400 group-hover:opacity-100"
            >
              <Trash2 size={14}/>
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}
