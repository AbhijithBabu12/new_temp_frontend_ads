import { useEffect, useRef, useState } from "react";
import ModeToggle from "./ModeToggle";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";

const DATA_STEPS = [
  { id: "upload", label: "Upload", hint: "Add dataset" },
  { id: "target", label: "Target", hint: "Pick outcome" },
  { id: "clean", label: "Columns", hint: "Refine inputs" },
  { id: "train", label: "Train", hint: "Compare models" },
  { id: "download", label: "Results", hint: "Review files" }
];

function inferDataStep(chat) {
  if (!chat || chat.mode !== "data" || chat.messages.length === 0) {
    return "upload";
  }

  const assistantMessages = chat.messages.filter((message) => message.role === "ai");
  const lastAssistant = assistantMessages[assistantMessages.length - 1];
  const content = `${lastAssistant?.content || ""} ${lastAssistant?.report || ""}`.toLowerCase();

  if (
    content.includes("download your results below") ||
    content.includes("would you like to download the trained model")
  ) {
    return "download";
  }

  if (
    content.includes("training complete") ||
    content.includes("best model") ||
    content.includes("model comparison")
  ) {
    return "train";
  }

  if (
    content.includes("drop any columns") ||
    content.includes("drop more columns") ||
    content.includes("enter one or more column names to drop")
  ) {
    return "clean";
  }

  if (
    content.includes("which column would you like to predict") ||
    content.includes("please choose a column") ||
    content.includes("please select a valid column")
  ) {
    return "target";
  }

  return "upload";
}

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

  const activeDataStep = inferDataStep(chat);

  return (
    <div key={chat.id} className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-transparent">
      <div className="px-6 pt-5 pb-4 flex flex-col items-center gap-4">
        <ModeToggle mode={chat.mode} switchMode={switchMode} />

        {chat.mode === "data" && (
          <div className="mx-auto w-full max-w-[860px]">
            <div className="grid grid-cols-5 gap-2 rounded-[28px] border border-[#706256]/12 bg-[linear-gradient(180deg,rgba(34,31,29,0.9),rgba(24,22,21,0.88))] p-2 shadow-[0_18px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              {DATA_STEPS.map((step, index) => {
                const isActive = step.id === activeDataStep;
                const isCompleted = DATA_STEPS.findIndex((item) => item.id === activeDataStep) > index;

                return (
                  <div
                    key={step.id}
                    className={`rounded-[20px] px-3 py-3 transition-all ${
                      isActive
                        ? "bg-[linear-gradient(135deg,#f3ebe2,#d8c2a7)] text-[#1e1712] shadow-[0_14px_28px_rgba(73,52,34,0.16)]"
                        : isCompleted
                          ? "bg-white/[0.06] text-[#efe7de]"
                          : "text-[#9d8f82]"
                    }`}
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="mt-2 text-sm font-semibold">{step.label}</div>
                    <div className={`mt-1 text-[11px] ${isActive ? "text-black/60" : "text-[#8f8174]"}`}>
                      {step.hint}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
            <p className="mt-3 max-w-xl text-center text-[15px] leading-7 text-[#a69689]">
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

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#171514] via-[#171514]/88 to-transparent pt-16">
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
