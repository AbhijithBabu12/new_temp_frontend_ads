import { Download, FileText, Image as ImageIcon, Sparkles } from "lucide-react";

function renderStructuredContent(content) {
  const sections = content.split(/\n\n+/).filter(Boolean);

  return (
    <div className="space-y-4">
      {sections.map((section, index) => {
        const lines = section.split("\n").filter(Boolean);
        const titleLine = lines[0]?.trim();
        const normalizedTitle = titleLine?.replace(/[^\w\s]/g, "").toLowerCase();
        const hasHeading =
          titleLine &&
          (titleLine.endsWith(":") ||
            [
              "dataset overview",
              "column guide",
              "recommended target",
              "prediction target",
              "dataset used for training",
              "model comparison",
              "best model",
              "why this model fits the dataset well",
              "target",
            ].includes(normalizedTitle));

        if (hasHeading && lines.length > 1) {
          return (
            <div key={index} className="rounded-2xl bg-[var(--message-card-bg)] px-4 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--message-accent)]">
                {titleLine.replace(/:$/, "")}
              </div>
              <div className="mt-3 space-y-2">
                {lines.slice(1).map((line, lineIndex) => (
                  <div key={lineIndex} className="text-[var(--assistant-text)]">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        if (lines.every((line) => line.startsWith("- "))) {
          return (
            <div key={index} className="space-y-2 rounded-2xl bg-[var(--message-card-bg)] px-4 py-3">
              {lines.map((line, lineIndex) => (
                <div key={lineIndex} className="text-[var(--assistant-text)]">
                  {line}
                </div>
              ))}
            </div>
          );
        }

        return (
          <p key={index} className="text-[var(--assistant-text)]">
            {section}
          </p>
        );
      })}
    </div>
  );
}

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
  const isStructuredAssistant =
    !isUser &&
    typeof displayContent === "string" &&
    (displayContent.includes("Dataset overview") ||
      displayContent.includes("Column guide") ||
      displayContent.includes("Training complete") ||
      displayContent.includes("Model comparison") ||
      displayContent.includes("Recommended target") ||
      displayContent.includes("Prediction target"));

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[min(88%,54rem)] whitespace-pre-wrap px-5 py-4 text-[15px] leading-7 transition-colors duration-300 ${
          isUser
            ? "rounded-[24px] rounded-br-md bg-[var(--user-bubble-bg)] text-[var(--user-bubble-text)]"
            : "rounded-[26px] rounded-bl-md border border-[var(--assistant-bubble-border)] bg-[var(--assistant-bubble-bg)] text-[var(--assistant-text)] shadow-[0_18px_40px_rgba(0,0,0,0.12)]"
        }`}
      >
        {message.content === "__loading__" ? (
          <div className="flex h-7 items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"></span>
            <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.15s]"></span>
            <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.3s]"></span>
          </div>
        ) : isStructuredAssistant ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--message-accent)]">
              <Sparkles size={13} />
              Analysis
            </div>
            {renderStructuredContent(displayContent)}
          </div>
        ) : (
          displayContent
        )}

        {message.report && (
          <div className="mt-4 rounded-[22px] border border-[var(--assistant-bubble-border)] bg-[var(--report-bg)] p-4">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--message-accent)]">
              <FileText size={13} />
              Report Snapshot
            </div>
            <pre className="overflow-x-auto text-xs leading-6 text-[var(--report-text)]">
              {message.report}
            </pre>
          </div>
        )}

        {imageFiles.length > 0 && (
          <div className="mt-4">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--message-accent)]">
              <ImageIcon size={13} />
              Plot Gallery
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {imageFiles.map((file, i) => (
                <a
                  key={i}
                  href={`${import.meta.env.VITE_API_URL}/download/${file}`}
                  download={file}
                  className="block overflow-hidden rounded-[20px] border border-[var(--assistant-bubble-border)] bg-[var(--plot-card-bg)] shadow-[0_14px_28px_rgba(0,0,0,0.14)]"
                >
                  <img
                    src={`${import.meta.env.VITE_API_URL}/download/${file}`}
                    alt={file}
                    className="h-auto w-full object-contain"
                  />
                  <div className="border-t border-[var(--plot-card-divider)] px-3 py-2 text-xs text-[var(--message-accent)]">
                    {file.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ")}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {allFiles.length > 0 && (
          <div className="mt-4">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--message-accent)]">
              <Download size={13} />
              Files
            </div>
            <div className="flex flex-wrap gap-2">
              {allFiles.map((file, i) => (
                <a
                  key={i}
                  href={`${import.meta.env.VITE_API_URL}/download/${file}`}
                  download={file}
                  className="inline-flex items-center rounded-full border border-[var(--assistant-bubble-border)] bg-[var(--file-pill-bg)] px-3 py-1.5 text-xs text-[var(--message-accent)] transition hover:bg-[var(--file-pill-hover)]"
                >
                  Download {file}
                </a>
              ))}
            </div>
          </div>
        )}

        {hasDownloadPrompt && (
          <div className="mt-4 border-t border-[var(--assistant-bubble-border)] pt-3 text-sm text-[var(--assistant-text)]">
            {downloadPrompt}
          </div>
        )}
      </div>
    </div>
  );
}
