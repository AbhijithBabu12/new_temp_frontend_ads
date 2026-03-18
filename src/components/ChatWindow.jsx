import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChartNoAxesColumnIncreasing } from "lucide-react";
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

  const assistantMessages = chat.messages.filter(
    (message) => message.role === "ai" && message.content !== "__loading__"
  );

  if (assistantMessages.length === 0) {
    return "upload";
  }

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

const LANDING_CONTENT = {
  chat: {
    eyebrow: "Conversational AI",
    title: "How can I help you?",
    subtitle:
      "Ask quick questions, explore ideas, and get polished answers in a calm focused workspace."
  },
  data: {
    eyebrow: "Autonomous Data Science",
    title: "Ready to analyze your dataset?",
    subtitle:
      "Upload a file, choose a target, refine your columns, and walk through training with guided model insights."
  }
};

export default function ChatWindow({ chat, updateMessages, switchMode }) {
  const endRef = useRef(null);
  const [landingAnimationKey, setLandingAnimationKey] = useState(0);
  const [workflowOpen, setWorkflowOpen] = useState(false);

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
  const landingContent = LANDING_CONTENT[chat.mode] || LANDING_CONTENT.chat;

  return (
    <div key={chat.id} className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-transparent">
      <div className="relative px-6 pt-5 pb-4">
        <div className="absolute left-1/2 top-5 -translate-x-1/2">
          <ModeToggle mode={chat.mode} switchMode={switchMode} />
        </div>

        <div className="flex min-h-[96px] items-start justify-end">
          {chat.mode === "data" && (
            <div className="mt-1 flex items-center gap-3">
              <div
                className={`overflow-hidden transition-all duration-300 ease-out ${
                  workflowOpen
                    ? "max-w-[720px] translate-x-0 opacity-100"
                    : "pointer-events-none max-w-0 translate-x-4 opacity-0"
                }`}
              >
                <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#706256]/12 bg-[linear-gradient(180deg,rgba(34,31,29,0.88),rgba(24,22,21,0.84))] px-2 py-2 shadow-[0_16px_32px_rgba(0,0,0,0.16)] backdrop-blur-xl">
                  {DATA_STEPS.map((step, index) => {
                    const isActive = step.id === activeDataStep;
                    const isCompleted = DATA_STEPS.findIndex((item) => item.id === activeDataStep) > index;

                    return (
                      <div
                        key={step.id}
                        className={`flex items-center gap-2 rounded-full px-3 py-1.5 transition-all ${
                          isActive
                            ? "bg-[linear-gradient(135deg,#f3ebe2,#d8c2a7)] text-[#1e1712] shadow-[0_14px_28px_rgba(73,52,34,0.16)]"
                            : isCompleted
                              ? "bg-white/[0.06] text-[#efe7de]"
                              : "text-[#9d8f82]"
                        }`}
                      >
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold uppercase tracking-[0.16em] ${
                            isActive ? "bg-black/10" : isCompleted ? "bg-white/[0.08]" : "bg-white/[0.04]"
                          }`}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        <div className="text-xs font-medium">{step.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setWorkflowOpen((value) => !value)}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-[#706256]/14 bg-[linear-gradient(180deg,rgba(34,31,29,0.92),rgba(24,22,21,0.88))] px-4 text-[#eadfd5] shadow-[0_16px_32px_rgba(0,0,0,0.16)] transition hover:bg-[linear-gradient(180deg,rgba(40,36,34,0.96),rgba(28,25,23,0.9))]"
              >
                <ChartNoAxesColumnIncreasing size={16} className="text-[#d4b89a]" />
                <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                  Workflow
                </span>
                <ChevronLeft
                  size={15}
                  className={`transition-transform duration-300 ${workflowOpen ? "rotate-0" : "rotate-180"}`}
                />
              </button>
            </div>
          )}
        </div>
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

            <div className="landing-copy flex flex-col items-center">
              <div className="landing-eyebrow text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c3ab94]">
                {landingContent.eyebrow}
              </div>
              <h1 className="landing-title mt-4 text-4xl font-semibold tracking-[-0.03em] text-white [text-shadow:0_18px_55px_rgba(0,0,0,0.36)]">
                {landingContent.title}
              </h1>
              <p className="landing-subtitle mt-3 max-w-xl text-center text-[15px] leading-7 text-[#a69689]">
                {landingContent.subtitle}
              </p>
            </div>
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
