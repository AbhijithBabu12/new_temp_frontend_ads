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
          const aiMessage = {
            role: "ai",
            content: uploadData.message || "File uploaded successfully.",
            files: uploadData.files || [],
            report: uploadData.report || null
          };

          updateMessages(chat.id, [...chat.messages, userMessage, aiMessage]);
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
      <div className="mx-auto w-full max-w-[860px]">
        <div className="relative rounded-[999px] border border-white/10 bg-[#303030]/92 backdrop-blur-sm">
            <input
              type="file"
              ref={fileRef}
              className="hidden"
              accept=".csv"
              onChange={handleFileUpload}
            />

            {selectedFile && (
              <div className="px-5 pt-2.5">
                <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-[#3d3d3f] px-3 py-1.5 text-sm text-gray-200">
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
                  : "Ask anything"
              }
              className={`h-[52px] max-h-28 w-full bg-transparent pr-18 pt-[13px] pb-2 text-[15px] leading-6 text-white resize-none overflow-hidden outline-none placeholder:text-[#b0b0b8] ${
                mode === "data" ? "pl-12" : "pl-5"
              }`}
              rows={1}
            />

            {mode === "data" && (
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
                <button
                  onClick={() => fileRef.current.click()}
                  className="rounded-full p-2 text-gray-300 transition hover:bg-white/5 hover:text-white"
                >
                  <Paperclip size={16} />
                </button>
              </div>
            )}

            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <button
                onClick={loading ? stopMessage : sendMessage}
                disabled={!loading && !input.trim() && !selectedFile}
                className={`rounded-full p-2.5 transition ${
                  loading || input.trim() || selectedFile
                    ? "bg-[#45454a] text-white hover:bg-[#505056]"
                    : "bg-[#3a3a3d] text-gray-400"
                }`}
              >
                {loading ? (
                  <Square size={15} className="fill-white" />
                ) : (
                  <ArrowUp size={15} className="stroke-[3]" />
                )}
              </button>
            </div>

        </div>
      </div>
    </div>
  );
}
