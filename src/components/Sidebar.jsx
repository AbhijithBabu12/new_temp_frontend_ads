// =============================
// Sidebar.jsx
// =============================
import { Plus, Trash2 } from "lucide-react";
import logoImage from "../assets/mc_logo.jpeg";

export default function Sidebar({ chats, newChat, setCurrentChatId, deleteChat, currentChatId }) {
  return (
    <aside className="relative z-20 flex w-[18rem] shrink-0 flex-col bg-[linear-gradient(180deg,rgba(18,22,20,0.98)_0%,rgba(15,18,16,0.96)_100%)] px-4 py-5 shadow-[18px_0_60px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.08),transparent_30%)]"></div>

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
        className="relative flex items-center gap-3 rounded-2xl border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] px-4 py-3 text-left text-white transition duration-200 hover:bg-white/[0.06]"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ecfdf5,#a7f3d0)] text-[#14532d] shadow-[0_10px_24px_rgba(16,185,129,0.2)]">
          <Plus size={18} />
        </span>
        <span>
          <span className="block text-sm font-semibold">New Chat</span>
          <span className="block text-xs text-[#97a39b]">Start a fresh conversation</span>
        </span>
      </button>

      <div className="relative mt-8 flex items-center justify-between">
        <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#7f8d82]">
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
                ? "border-emerald-400/18 bg-[linear-gradient(135deg,rgba(16,185,129,0.12),rgba(255,255,255,0.03))] shadow-[0_10px_30px_rgba(0,0,0,0.16)]"
                : "border-transparent hover:bg-white/[0.04]"
            }`}
          >
            <div
              onClick={() => setCurrentChatId(chat.id)}
              className="min-w-0 flex-1 cursor-pointer"
            >
              <div className="truncate text-sm font-medium text-[#edf2ee]">{chat.title}</div>
              <div className="mt-1 truncate text-xs text-[#829086]">
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
