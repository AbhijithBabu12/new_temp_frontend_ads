import { useEffect, useRef, useState } from "react";
import { ArrowUp, Paperclip, Square, X } from "lucide-react";

export default function ChatInput({ chat, updateMessages, mode }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [abortController, setAbortController] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [input, selectedFile]);

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

  const canSend = Boolean(input.trim() || selectedFile);

  return (
    <div className="px-6 pb-6">
      <div className="mx-auto w-full max-w-[900px]">
        <div className={`border border-[var(--composer-border)] bg-[var(--composer-bg)] shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-all duration-200 ${
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
              <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--chip-border)] bg-[var(--chip-bg)] px-3 py-2 text-sm text-[var(--chip-text)] shadow-[0_10px_24px_rgba(0,0,0,0.12)]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--chip-icon-bg)] text-[var(--chip-icon)]">
                  <Paperclip size={13} />
                </span>
                <span className="max-w-[220px] truncate font-medium">{selectedFile.name}</span>
                <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--chip-muted)]">CSV</span>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="rounded-full p-1 text-[var(--chip-muted)] transition hover:bg-[var(--chip-hover)] hover:text-[var(--chip-text)]"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 px-3 py-3">
            {mode === "data" && (
              <button
                onClick={() => fileRef.current.click()}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--composer-icon-bg)] text-[var(--composer-icon)] transition hover:bg-[var(--composer-icon-hover-bg)] hover:text-[var(--composer-icon-hover)]"
              >
                <Paperclip size={18} />
              </button>
            )}

            <textarea
              ref={textareaRef}
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
              className="min-h-[46px] max-h-40 flex-1 resize-none overflow-y-auto bg-transparent px-1 pt-[11px] text-[15px] font-normal leading-6 text-[var(--composer-text)] outline-none placeholder:font-normal placeholder:text-[var(--composer-placeholder)]"
              rows={1}
            />

            <button
              onClick={loading ? stopMessage : sendMessage}
              disabled={!loading && !canSend}
              className={`relative flex h-11 w-11 items-center justify-center rounded-full shadow-[0_10px_24px_rgba(0,0,0,0.14)] transition ${
                loading
                  ? "bg-[linear-gradient(135deg,#f1ddc9,#caa684)] text-[#241a13]"
                  : canSend
                    ? "bg-[linear-gradient(135deg,#f5ede5,#d2b497)] text-[#241a13] hover:brightness-105"
                    : "bg-[var(--composer-send-idle-bg)] text-[var(--composer-send-idle-text)]"
              }`}
            >
              {loading ? (
                <Square size={15} className="fill-black" />
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
