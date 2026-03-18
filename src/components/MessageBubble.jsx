export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const downloadPrompt = "Would you like to download the trained model, report, and plots? (yes/no)";
  const promptPattern =
    /\s*Would you like to download the trained model, report, and plots\? \(yes\/no\)\s*$/;
  const hasDownloadPrompt =
    typeof message.content === "string" && promptPattern.test(message.content);
  const displayContent =
    typeof message.content === "string"
      ? message.content.replace(promptPattern, "").trim()
      : message.content;
  const imageFiles = (message.files || []).filter((file) =>
    /\.(png|jpg|jpeg|gif|webp)$/i.test(file)
  );
  const allFiles = message.files || [];

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[min(86%,50rem)] whitespace-pre-wrap px-5 py-4 text-[15px] leading-7 shadow-[0_16px_50px_rgba(0,0,0,0.12)] ${
          isUser
            ? "rounded-[28px] rounded-br-lg border border-white/8 bg-[linear-gradient(135deg,rgba(63,64,72,0.95),rgba(48,48,54,0.92))] text-white"
            : "rounded-[28px] rounded-bl-lg border border-white/8 bg-[linear-gradient(180deg,rgba(39,39,43,0.98),rgba(32,32,36,0.95))] text-[#ececf1]"
        }`}
      >
        {message.content === "__loading__" ? (
          <div className="flex h-7 items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"></span>
            <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.15s]"></span>
            <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.3s]"></span>
          </div>
        ) : (
          displayContent
        )}

        {message.report && (
          <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/8 bg-black/28 p-4 text-xs leading-6 text-[#d7d9e2]">
            {message.report}
          </pre>
        )}

        {imageFiles.length > 0 && (
          <div className="mt-4 flex flex-col gap-4">
            {imageFiles.map((file, i) => (
              <a
                key={i}
                href={`${import.meta.env.VITE_API_URL}/download/${file}`}
                download={file}
                className="block overflow-hidden rounded-[22px] border border-white/10 bg-black/20 shadow-[0_16px_40px_rgba(0,0,0,0.16)]"
              >
                <img
                  src={`${import.meta.env.VITE_API_URL}/download/${file}`}
                  alt={file}
                  className="h-auto w-full object-contain"
                />
              </a>
            ))}
          </div>
        )}

        {allFiles.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {allFiles.map((file, i) => (
              <a
                key={i}
                href={`${import.meta.env.VITE_API_URL}/download/${file}`}
                download={file}
                className="rounded-full border border-white/8 bg-white/[0.05] px-3 py-1.5 text-xs text-[#c6d4ff] transition hover:bg-white/[0.08]"
              >
                Download {file}
              </a>
            ))}
          </div>
        )}

        {hasDownloadPrompt && (
          <div className="mt-4 border-t border-white/10 pt-3 text-sm text-[#ececf1]">
            {downloadPrompt}
          </div>
        )}
      </div>
    </div>
  );
}
