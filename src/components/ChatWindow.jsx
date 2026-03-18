import { useEffect, useRef, useState } from "react";
import ModeToggle from "./ModeToggle";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({ chat, updateMessages, switchMode }) {
  const endRef = useRef(null);
  const [landingAnimationKey, setLandingAnimationKey] = useState(0);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  useEffect(() => {
    if (chat?.messages?.length === 0) {
      setLandingAnimationKey((value) => value + 1);
    }
  }, [chat?.id, chat?.messages?.length]);

  if (!chat) return null;

  return (
    <div key={chat.id} className="flex-1 min-w-0 min-h-0 flex flex-col relative overflow-hidden bg-[#212121]">
      <div className="px-6 pt-4 pb-3 flex justify-center">
        <ModeToggle mode={chat.mode} switchMode={switchMode} />
      </div>

      {chat.messages.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center -mt-20">
          <div
            key={landingAnimationKey}
            className="landing-logo-scene relative flex flex-col items-center"
          >
            <div className="landing-logo-beam"></div>
            <div className="landing-logo-aura"></div>

            <button
              type="button"
              onClick={() => setLandingAnimationKey((value) => value + 1)}
              className="landing-logo-button mb-6"
              aria-label="Replay logo animation"
            >
              <img
                src="/sent.png"
                alt="Landing logo"
                className="landing-logo-image"
              />
            </button>

            <h1 className="text-3xl font-semibold tracking-tight text-white [text-shadow:0_10px_40px_rgba(0,0,0,0.38)]">
              How can I help you?
            </h1>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto scroll-smooth">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 pt-6 pb-40">
          {chat.messages.map((m, i) => (
            <MessageBubble key={i} message={m} />
          ))}

          <div ref={endRef}></div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#212121] via-[#212121]/85 to-transparent pt-14">
        <div className="pointer-events-auto">
          <ChatInput
            chat={chat}
            updateMessages={updateMessages}
            mode={chat.mode}
          />
        </div>
      </div>
    </div>
  );
}
