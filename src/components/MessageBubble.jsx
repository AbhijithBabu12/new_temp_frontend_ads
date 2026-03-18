export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const downloadPrompt = "Would you like to download the trained model, report, and plots? (yes/no)";
  const hasDownloadPrompt =
    typeof message.content === "string" && message.content.includes(downloadPrompt);
  const displayContent = hasDownloadPrompt
    ? message.content.replace(downloadPrompt, "").trim()
    : message.content;
  const imageFiles = (message.files || []).filter((file) =>
    /\.(png|jpg|jpeg|gif|webp)$/i.test(file)
  );
  const downloadFiles = (message.files || []).filter((file) => !imageFiles.includes(file));

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[min(85%,48rem)] whitespace-pre-wrap px-5 py-4 text-[15px] leading-7 ${
          isUser
            ? "rounded-[24px] rounded-br-md bg-[#303036] text-white"
            : "rounded-[24px] rounded-bl-md bg-[#2a2a2d] text-[#ececf1]"
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
          <pre className="mt-3 overflow-x-auto rounded-lg bg-black/30 p-3 text-xs">
            {message.report}
          </pre>
        )}

        {imageFiles.length > 0 && (
          <div className="mt-3 flex flex-col gap-3">
            {imageFiles.map((file, i) => (
              <a
                key={i}
                href={`${import.meta.env.VITE_API_URL}/download/${file}`}
                download={file}
                className="block overflow-hidden rounded-xl border border-white/10 bg-black/20"
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

        {message.files && message.files.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {downloadFiles.map((file, i) => (
              <a
                key={i}
                href={`${import.meta.env.VITE_API_URL}/download/${file}`}
                download={file}
                className="text-xs text-blue-400 hover:underline"
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
