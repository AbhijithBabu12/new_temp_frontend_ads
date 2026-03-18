import { useMemo, useState } from "react";
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  MessageSquareText,
  Plus,
  Trash2
} from "lucide-react";
import logoImage from "../assets/mc_logo.jpeg";

function formatRelativeTime(timestamp) {
  if (!timestamp) return "Just now";

  const diffMs = Date.now() - timestamp;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });
}

export default function Sidebar({ chats, newChat, setCurrentChatId, deleteChat, currentChatId }) {
  const [sectionsOpen, setSectionsOpen] = useState({
    chat: true,
    data: true
  });

  const groupedChats = useMemo(
    () => ({
      chat: chats.filter((chat) => chat.mode === "chat"),
      data: chats.filter((chat) => chat.mode === "data")
    }),
    [chats]
  );

  const toggleSection = (section) => {
    setSectionsOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <aside className="relative z-20 flex w-[18rem] shrink-0 flex-col bg-[linear-gradient(180deg,rgba(22,20,19,0.98)_0%,rgba(17,16,15,0.96)_100%)] px-4 py-5 shadow-[18px_0_60px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,185,142,0.08),transparent_30%)]"></div>

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
        className="relative flex items-center gap-3 rounded-2xl border border-[#706256]/14 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-4 py-3 text-left text-white transition duration-200 hover:bg-white/[0.05]"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f4eadf,#d7bda4)] text-[#5b493d] shadow-[0_10px_24px_rgba(145,114,86,0.18)]">
          <Plus size={18} />
        </span>
        <span>
          <span className="block text-sm font-semibold">New Chat</span>
          <span className="block text-xs text-[#a19184]">Start a fresh conversation</span>
        </span>
      </button>

      <div className="relative mt-8 flex items-center justify-between">
        <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#87796d]">
          Recent Chats
        </div>
        <div className="ml-3 h-px flex-1 bg-white/6"></div>
      </div>

      <div className="relative mt-4 flex-1 overflow-y-auto pr-1">
        {[
          {
            key: "chat",
            label: "Chats",
            icon: MessageSquareText,
            items: groupedChats.chat
          },
          {
            key: "data",
            label: "Data Science",
            icon: BarChart3,
            items: groupedChats.data
          }
        ].map(({ key, label, icon: Icon, items }) => (
          <div key={key} className="mb-4">
            <button
              type="button"
              onClick={() => toggleSection(key)}
              className="mb-2 flex w-full items-center justify-between rounded-xl px-2 py-2 text-left transition hover:bg-white/[0.03]"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-[#d9d0c8]">
                <Icon size={15} className="text-[#b99c7f]" />
                <span>{label}</span>
                <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[11px] text-[#a79484]">
                  {items.length}
                </span>
              </div>
              {sectionsOpen[key] ? (
                <ChevronDown size={15} className="text-[#9c8a7d]" />
              ) : (
                <ChevronRight size={15} className="text-[#9c8a7d]" />
              )}
            </button>

            {sectionsOpen[key] && (
              <div className="space-y-2">
                {items.map((chat) => {
                  const isActive = currentChatId === chat.id;

                  return (
                    <div
                      key={chat.id}
                      className={`group flex items-center justify-between rounded-2xl border px-3 py-3 transition ${
                        isActive
                          ? "border-[#d2b497]/26 bg-[linear-gradient(135deg,rgba(210,180,151,0.16),rgba(255,255,255,0.03))] shadow-[0_10px_30px_rgba(0,0,0,0.16)]"
                          : "border-transparent hover:bg-white/[0.04]"
                      }`}
                    >
                      <div
                        onClick={() => setCurrentChatId(chat.id)}
                        className="min-w-0 flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                              isActive ? "bg-black/10 text-[#f6ece2]" : "bg-white/[0.05] text-[#b89d82]"
                            }`}
                          >
                            {chat.mode === "data" ? <BarChart3 size={14} /> : <MessageSquareText size={14} />}
                          </span>

                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-[#f0ece8]">{chat.title}</div>
                            <div className="mt-1 flex items-center gap-2 text-xs text-[#93867a]">
                              <span>{chat.mode === "data" ? "Data Science workspace" : "Conversation"}</span>
                              <span className="h-1 w-1 rounded-full bg-[#7a6b5e]"></span>
                              <span>{formatRelativeTime(chat.updatedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(chat.id);
                        }}
                        className="ml-3 rounded-full p-2 text-gray-500 opacity-0 transition hover:bg-white/6 hover:text-red-400 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
