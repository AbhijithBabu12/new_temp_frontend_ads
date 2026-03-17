import { useEffect, useRef } from "react";
import ModeToggle from "./ModeToggle";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({ chat, updateMessages, switchMode }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  if (!chat) return null;

  return (
    <div key={chat.id} className="flex-1 min-w-0 min-h-0 flex flex-col relative overflow-hidden bg-[#212121]">
      <div className="px-6 pt-4 pb-3 flex justify-center">
        <ModeToggle mode={chat.mode} switchMode={switchMode} />
      </div>

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

      <div className="flex-1 min-h-0 overflow-y-auto scroll-smooth">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 pt-6 pb-32">
          {chat.messages.map((m, i) => (
            <MessageBubble key={i} message={m} />
          ))}

          <div ref={endRef}></div>
        </div>
      </div>

      <ChatInput
        chat={chat}
        updateMessages={updateMessages}
        mode={chat.mode}
      />
    </div>
  );
}
