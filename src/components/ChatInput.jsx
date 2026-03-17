import { useRef, useState } from "react";
import { ArrowUp, Paperclip, Square } from "lucide-react";

export default function ChatInput({ chat, updateMessages, mode }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [abortController, setAbortController] = useState(null);
  const fileRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const messageText = input;
    const userMessage = { role: "user", content: messageText };
    const loadingMessage = { role: "ai", content: "Thinking..." };

    updateMessages(chat.id, [...chat.messages, userMessage, loadingMessage]);
    setInput("");
    setLoading(true);

    try {
      const API = import.meta.env.VITE_API_URL;
      const controller = new AbortController();
      const signal = controller.signal;
      setAbortController(controller);

      const updatedMessages = [
        ...chat.messages,
        userMessage,
        { role: "ai", content: "" }
      ];

      updateMessages(chat.id, updatedMessages);

      const res = await fetch(
        `${API}/message?mode=${mode}&message=${encodeURIComponent(messageText)}`,
        {
          method: "POST",
          signal
        }
      );

      if (!res.ok || !res.body) {
        throw new Error("Failed to start stream");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulated = "";
      let flushTimeout = null;

      const flushMessages = () => {
        updateMessages(chat.id, [
          ...updatedMessages.slice(0, -1),
          { role: "ai", content: accumulated }
        ]);
      };

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        const chunk = decoder.decode(value || new Uint8Array());
        accumulated += chunk;

        if (flushTimeout) {
          clearTimeout(flushTimeout);
        }

        flushTimeout = setTimeout(() => {
          flushMessages();
        }, 20);
      }

      if (flushTimeout) {
        clearTimeout(flushTimeout);
      }

      flushMessages();
    } catch (error) {
      if (error.name === "AbortError") {
        updateMessages(chat.id, [
          ...chat.messages,
          userMessage,
          { role: "ai", content: "Generation stopped." }
        ]);
      } else {
        console.error(error);
        updateMessages(chat.id, [
          ...chat.messages,
          userMessage,
          { role: "ai", content: "Error connecting to backend" }
        ]);
      }
    } finally {
      setAbortController(null);
      setLoading(false);
    }
  };

  const stopMessage = () => {
    abortController?.abort();
    setLoading(false);
  };

  return (
    <div className="px-4 pb-6 flex justify-center">
      <div className="w-full max-w-3xl">
        <div className="relative bg-[#2f2f31] rounded-2xl border border-[#3d3d40] shadow-lg">
          <input
            type="file"
            ref={fileRef}
            className="hidden"
            accept=".csv"
          />

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={
              mode === "data"
                ? "Ask about your dataset..."
                : "Message your AI..."
            }
            className="w-full bg-transparent text-white px-4 pt-4 pb-14 resize-none outline-none placeholder:text-gray-500"
            rows={2}
          />

          {mode === "data" && (
            <div className="absolute bottom-3 left-3">
              <button
                onClick={() => fileRef.current.click()}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <Paperclip size={18} />
              </button>
            </div>
          )}

          <div className="absolute bottom-3 right-3">
            <button
              onClick={loading ? stopMessage : sendMessage}
              disabled={!loading && !input.trim()}
              className={`p-2 rounded-full transition ${
                loading || input.trim()
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-[#3d3d40] text-gray-500"
              }`}
            >
              {loading ? (
                <Square size={16} className="fill-black" />
              ) : (
                <ArrowUp size={16} className="stroke-[3]" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-2 text-center text-xs text-gray-500">
          Autonomous Data Scientist may produce inaccurate results.
        </div>
      </div>
    </div>
  );
}
