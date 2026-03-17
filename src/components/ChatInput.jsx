import { useRef, useState } from "react";
import { ArrowUp, Paperclip, Square } from "lucide-react";

export default function ChatInput({ chat, updateMessages, mode }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [abortController, setAbortController] = useState(null);
  const fileRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const API = import.meta.env.VITE_API_URL;

    try {
      const res = await fetch(`${API}/upload`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      updateMessages(chat.id, [
        ...chat.messages,
        { role: "user", content: `Uploaded: ${file.name}` },
        { role: "ai", content: data.message }
      ]);
    } catch (err) {
      updateMessages(chat.id, [
        ...chat.messages,
        { role: "ai", content: "Upload failed" }
      ]);
    } finally {
      e.target.value = "";
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const messageText = input;
    const userMessage = { role: "user", content: messageText };
    const updatedMessages = [
      ...chat.messages,
      userMessage,
      { role: "ai", content: "__loading__" }
    ];

    updateMessages(chat.id, updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const API = import.meta.env.VITE_API_URL;
      const controller = new AbortController();
      const signal = controller.signal;
      setAbortController(controller);

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
        if (signal.aborted) break;

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
          ...updatedMessages.slice(0, -1),
          { role: "ai", content: `${accumulated} [stopped]` }
        ]);
      } else {
        console.error(error);
        updateMessages(chat.id, [
          ...updatedMessages.slice(0, -1),
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
    <div className="sticky bottom-0 z-10 px-6 pb-6 pt-3">
      <div className="mx-auto w-full max-w-4xl">
        <div className="rounded-[2rem] border border-white/10 bg-[#2a2a2e]/95 shadow-[0_-12px_40px_rgba(0,0,0,0.32)] backdrop-blur">
          <div className="relative">
            <input
              type="file"
              ref={fileRef}
              className="hidden"
              accept=".csv"
              onChange={handleFileUpload}
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
              className="min-h-[120px] w-full bg-transparent px-6 pt-5 pb-16 text-[15px] text-white resize-none outline-none placeholder:text-[#81818b]"
              rows={3}
            />

            {mode === "data" && (
              <div className="absolute bottom-3 left-3">
                <button
                  onClick={() => fileRef.current.click()}
                  className="rounded-xl p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
                >
                  <Paperclip size={18} />
                </button>
              </div>
            )}

            <div className="absolute bottom-4 right-4">
              <button
                onClick={loading ? stopMessage : sendMessage}
                disabled={!loading && !input.trim()}
                className={`rounded-full p-2 transition ${
                  loading || input.trim()
                    ? "bg-white text-black hover:bg-[#e8e8e8]"
                    : "bg-[#3a3a40] text-gray-500"
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
        </div>

        <div className="mt-3 text-center text-xs text-gray-500">
          Autonomous Data Scientist may produce inaccurate results.
        </div>
      </div>
    </div>
  );
}
