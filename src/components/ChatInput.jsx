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

  const buildAiMessage = (data, fallbackMessage = "Done.") => {
    const normalizedContent =
      typeof data.message === "object" && data.message !== null
        ? data.message.message || fallbackMessage
        : data.message || fallbackMessage;

    const normalizedFiles =
      typeof data.message === "object" && data.message !== null
        ? data.message.files || data.files || []
        : data.files || [];

    const normalizedReport =
      typeof data.message === "object" && data.message !== null
        ? data.message.report || data.report || null
        : data.report || null;

    return {
      role: "ai",
      content: normalizedContent,
      files: normalizedFiles,
      report: normalizedReport
    };
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
          const aiMessage = buildAiMessage(uploadData, "File uploaded successfully.");

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

      const contentType = res.headers.get("content-type") || "";

      if (mode === "data" || contentType.includes("application/json")) {
        const data = await res.json();
        const aiMessage = buildAiMessage(data, "Done.");

        updateMessages(chat.id, [
          ...updatedMessages.slice(0, -1),
          aiMessage
        ]);
        setSelectedFile(null);
        return;
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
      <div className="mx-auto w-full max-w-[900px]">
        <div className={`bg-[linear-gradient(180deg,rgba(36,32,30,0.92),rgba(26,24,23,0.9))] shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl ${
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
            <div className="px-4 pt-4">
              <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1.5 text-sm text-[#e6ddd5] shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
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
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.04] text-[#cfc4bb] transition hover:bg-white/8 hover:text-white"
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
              className="h-[46px] max-h-28 flex-1 bg-transparent px-1 pt-[11px] text-[15px] font-normal leading-6 text-white resize-none overflow-hidden outline-none placeholder:font-normal placeholder:text-[#aa9f95]"
              rows={1}
            />

            <button
              onClick={loading ? stopMessage : sendMessage}
              disabled={!loading && !input.trim() && !selectedFile}
              className={`flex h-11 w-11 items-center justify-center rounded-full shadow-[0_10px_24px_rgba(0,0,0,0.2)] transition ${
                loading || input.trim() || selectedFile
                  ? "bg-[linear-gradient(135deg,#f5ede5,#d2b497)] text-[#241a13] hover:brightness-105"
                  : "bg-white/[0.06] text-[#8f847a]"
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
