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
    <div key={chat.id} className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-transparent">
      <div className="px-6 pt-5 pb-4 flex justify-center">
        <ModeToggle mode={chat.mode} switchMode={switchMode} />
      </div>

      {chat.messages.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center -mt-20">
          <div
            key={landingAnimationKey}
            className="landing-logo-scene relative flex flex-col items-center"
          >
            <div className="landing-logo-beam"></div>
            <div className="landing-logo-aura"></div>

            <button
              type="button"
              onClick={() => setLandingAnimationKey((value) => value + 1)}
              className="landing-logo-button pointer-events-auto mb-6"
              aria-label="Replay logo animation"
            >
              <img
                src="/sent.png"
                alt="Landing logo"
                className="landing-logo-image"
              />
            </button>

            <h1 className="text-4xl font-semibold tracking-[-0.03em] text-white [text-shadow:0_18px_55px_rgba(0,0,0,0.36)]">
              How can I help you?
            </h1>
            <p className="mt-3 max-w-xl text-center text-[15px] leading-7 text-[#97a89c]">
              Ask anything in chat mode, or switch into data science mode for guided dataset analysis and model evaluation.
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto scroll-smooth">
        <div className="mx-auto flex w-full max-w-[72rem] flex-col gap-7 px-6 pt-4 pb-44">
          {chat.messages.map((m, i) => (
            <MessageBubble key={i} message={m} />
          ))}

          <div ref={endRef}></div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#151816] via-[#151816]/88 to-transparent pt-16">
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
