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
    <aside className="relative z-20 flex w-[18rem] shrink-0 flex-col bg-[var(--sidebar-bg)] px-4 py-5 shadow-[18px_0_60px_rgba(0,0,0,0.16)] backdrop-blur-2xl transition-colors duration-300">
      <div className="pointer-events-none absolute inset-0 bg-[var(--sidebar-aura)]"></div>

      <div className="relative mb-8 flex items-center gap-3">
        <img
          src={logoImage}
          alt="Mclovin logo"
          className="h-11 w-11 rounded-full object-cover ring-1 ring-white/10"
        />
        <div className="text-lg font-semibold tracking-[0.01em] text-[var(--sidebar-title)]">Mclovin</div>
      </div>

      <button
        onClick={newChat}
        className="relative flex items-center gap-3 rounded-2xl border border-[var(--sidebar-button-border)] bg-[var(--sidebar-button-bg)] px-4 py-3 text-left text-[var(--sidebar-title)] transition duration-200 hover:bg-[var(--sidebar-button-hover)]"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f4eadf,#d7bda4)] text-[#5b493d] shadow-[0_10px_24px_rgba(145,114,86,0.18)]">
          <Plus size={18} />
        </span>
        <span>
          <span className="block text-sm font-semibold">New Chat</span>
          <span className="block text-xs text-[var(--sidebar-muted)]">Start a fresh conversation</span>
        </span>
      </button>

      <div className="relative mt-8 flex items-center justify-between">
        <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--sidebar-muted)]">
          Recent Chats
        </div>
        <div className="ml-3 h-px flex-1 bg-[var(--sidebar-divider)]"></div>
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
              className="mb-2 flex w-full items-center justify-between rounded-xl px-2 py-2 text-left transition hover:bg-[var(--sidebar-hover)]"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--sidebar-title)]">
                <Icon size={15} className="text-[var(--sidebar-accent)]" />
                <span>{label}</span>
                <span className="rounded-full bg-[var(--sidebar-pill-bg)] px-2 py-0.5 text-[11px] text-[var(--sidebar-muted)]">
                  {items.length}
                </span>
              </div>
              {sectionsOpen[key] ? (
                <ChevronDown size={15} className="text-[var(--sidebar-muted)]" />
              ) : (
                <ChevronRight size={15} className="text-[var(--sidebar-muted)]" />
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
                          ? "border-[var(--sidebar-active-border)] bg-[var(--sidebar-active-bg)] shadow-[0_10px_30px_rgba(0,0,0,0.1)]"
                          : "border-transparent hover:bg-[var(--sidebar-hover)]"
                      }`}
                    >
                      <div
                        onClick={() => setCurrentChatId(chat.id)}
                        className="min-w-0 flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                              isActive ? "bg-black/10 text-[var(--sidebar-title)]" : "bg-[var(--sidebar-pill-bg)] text-[var(--sidebar-accent)]"
                            }`}
                          >
                            {chat.mode === "data" ? <BarChart3 size={14} /> : <MessageSquareText size={14} />}
                          </span>

                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-[var(--sidebar-title)]">{chat.title}</div>
                            <div className="mt-1 flex items-center gap-2 text-xs text-[var(--sidebar-muted)]">
                              <span>{chat.mode === "data" ? "Data Science workspace" : "Conversation"}</span>
                              <span className="h-1 w-1 rounded-full bg-[var(--sidebar-dot)]"></span>
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
                        className="ml-3 rounded-full p-2 text-[var(--sidebar-muted)] opacity-0 transition hover:bg-[var(--sidebar-hover)] hover:text-red-400 group-hover:opacity-100"
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
