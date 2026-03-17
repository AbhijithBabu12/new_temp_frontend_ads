import ModeToggle from "./ModeToggle";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import { useEffect, useRef } from "react";

export default function ChatWindow({ chat, updateMessages, switchMode }) {
  const endRef = useRef(null);

  // ✅ Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  if (!chat) return null;

  return (
    <div key={chat.id} className="flex-1 flex flex-col relative">

      {/* MODE SWITCH */}
      <ModeToggle mode={chat.mode} switchMode={switchMode} />

      {/* WELCOME SCREEN */}
      {chat.messages.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center -mt-20 pointer-events-none">

          <img
            src="/sent.png"
            className="w-14 h-14 mb-4 opacity-90 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          />

          <h1 className="text-3xl font-semibold text-white">
            How can I help you?
          </h1>

        </div>
      )}

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-3xl mx-auto w-full">

        {chat.messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}

        <div ref={endRef}></div>
      </div>

      {/* INPUT */}
      <ChatInput
        chat={chat}
        updateMessages={updateMessages}
        mode={chat.mode}   // 🔥 important fix
      />
    </div>
  );
}