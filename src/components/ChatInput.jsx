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
          const normalizedContent =
            typeof uploadData.message === "object" && uploadData.message !== null
              ? uploadData.message.message || "File uploaded successfully."
              : uploadData.message || "File uploaded successfully.";

          const normalizedFiles =
            typeof uploadData.message === "object" && uploadData.message !== null
              ? uploadData.message.files || uploadData.files || []
              : uploadData.files || [];

          const normalizedReport =
            typeof uploadData.message === "object" && uploadData.message !== null
              ? uploadData.message.report || uploadData.report || null
              : uploadData.report || null;

          const aiMessage = {
            role: "ai",
            content: normalizedContent,
            files: normalizedFiles,
            report: normalizedReport
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
        <div className={`border border-white/10 bg-[#303030]/92 backdrop-blur-sm ${
          selectedFile ? "rounded-[28px]" : "rounded-[999px]"
        }`}>
          <input
            type="file"
            ref={fileRef}
            className="hidden"
            accept=".csv"
            onChange={handleFileUpload}
          />

          {selectedFile && (
            <div className="px-4 pt-3">
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

          <div className="flex items-center gap-3 px-3 py-3">
            {mode === "data" && (
              <button
                onClick={() => fileRef.current.click()}
                className="flex h-10 w-10 items-center justify-center rounded-full text-gray-300 transition hover:bg-white/5 hover:text-white"
              >
                <Paperclip size={18} />
              </button>
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
              className="h-[44px] max-h-28 flex-1 bg-transparent px-1 pt-[10px] text-[15px] font-normal leading-5 text-white resize-none overflow-hidden outline-none placeholder:font-normal placeholder:text-[#b0b0b8]"
              rows={1}
            />

            <button
              onClick={loading ? stopMessage : sendMessage}
              disabled={!loading && !input.trim() && !selectedFile}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                loading || input.trim() || selectedFile
                  ? "bg-white text-black hover:bg-[#e8e8e8]"
                  : "bg-[#3a3a3d] text-gray-400"
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
