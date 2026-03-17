import { useRef, useState } from "react";
import { ArrowUp, Paperclip, Square } from "lucide-react";

export default function ChatInput({ chat, updateMessages, mode }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [abortController, setAbortController] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    e.target.value = "";
  };

  const sendMessage = async () => {
    if ((!input.trim() && !selectedFile) || loading) return;

    const messageText = input;
    let accumulated = "";
    const userContent = selectedFile
      ? messageText.trim()
        ? `${messageText}\n\nAttached: ${selectedFile.name}`
        : `Attached: ${selectedFile.name}`
      : messageText;
    const userMessage = { role: "user", content: userContent };
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

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadRes = await fetch(`${API}/upload`, {
          method: "POST",
          body: formData,
          signal
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          throw new Error(uploadData.message || "Upload failed");
        }

        if (!messageText.trim()) {
          updateMessages(chat.id, [
            ...updatedMessages.slice(0, -1),
            { role: "ai", content: uploadData.message || "File uploaded successfully." }
          ]);
          setSelectedFile(null);
          return;
        }
      }

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
      setSelectedFile(null);
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
          { role: "ai", content: error.message || "Error connecting to backend" }
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
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-[1.75rem] border border-white/10 bg-[#2a2a2e]/95 shadow-[0_-12px_40px_rgba(0,0,0,0.32)] backdrop-blur">
          <div className="relative">
            <input
              type="file"
              ref={fileRef}
              className="hidden"
              accept=".csv"
              onChange={handleFileUpload}
            />

            {selectedFile && (
              <div className="px-4 pt-4">
                <div className="inline-flex max-w-full items-center gap-2 rounded-2xl border border-white/10 bg-[#34343a] px-3 py-2 text-sm text-gray-200">
                  <span className="max-w-[220px] truncate">{selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="rounded-full px-1 text-gray-400 transition hover:text-white"
                  >
                    x
                  </button>
                </div>
              </div>
            )}

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
              className="min-h-[64px] max-h-40 w-full bg-transparent px-5 pt-4 pb-14 text-[15px] text-white resize-none outline-none placeholder:text-[#81818b]"
              rows={1}
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

            <div className="absolute bottom-3 right-3">
              <button
                onClick={loading ? stopMessage : sendMessage}
                disabled={!loading && !input.trim() && !selectedFile}
                className={`rounded-full p-2 transition ${
                  loading || input.trim() || selectedFile
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
