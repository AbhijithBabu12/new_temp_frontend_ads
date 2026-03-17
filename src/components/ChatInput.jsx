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
          if (typeof uploadData.message === "object" && uploadData.message !== null) {
            updateMessages(chat.id, [
              ...chat.messages,
              { role: "user", content: messageText },
              {
                role: "ai",
                content: uploadData.message.message,
                files: uploadData.message.files
              }
            ]);
          } else {
            updateMessages(chat.id, [
              ...chat.messages,
              { role: "user", content: messageText },
              { role: "ai", content: uploadData.message || "File uploaded successfully." }
            ]);
          }
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
    <div className="px-6 pb-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="relative rounded-[1.75rem] bg-[rgba(52,53,65,0.18)] backdrop-blur-sm">
            <input
              type="file"
              ref={fileRef}
              className="hidden"
              accept=".csv"
              onChange={handleFileUpload}
            />

            {selectedFile && (
              <div className="px-4 pt-4">
                <div className="inline-flex max-w-full items-center gap-2 rounded-2xl bg-[rgba(90,90,102,0.55)] px-3 py-2 text-sm text-gray-200">
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
              className="min-h-[64px] max-h-40 w-full bg-transparent px-5 pt-4 pb-14 text-[15px] text-white resize-none outline-none placeholder:text-[#a1a1aa]"
              rows={1}
            />

            {mode === "data" && (
              <div className="absolute bottom-3 left-3">
                <button
                  onClick={() => fileRef.current.click()}
                  className="rounded-xl p-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
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
                    ? "bg-[rgba(255,255,255,0.88)] text-black hover:bg-white"
                    : "bg-[rgba(76,76,86,0.55)] text-gray-400"
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
    </div>
  );
}
