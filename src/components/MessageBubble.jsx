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
            <div key={index} className="rounded-2xl bg-white/[0.035] px-4 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#bda792]">
                {titleLine.replace(/:$/, "")}
              </div>
              <div className="mt-3 space-y-2">
                {lines.slice(1).map((line, lineIndex) => (
                  <div key={lineIndex} className="text-[#ece6e0]">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        if (lines.every((line) => line.startsWith("- "))) {
          return (
            <div key={index} className="space-y-2 rounded-2xl bg-white/[0.03] px-4 py-3">
              {lines.map((line, lineIndex) => (
                <div key={lineIndex} className="text-[#ece6e0]">
                  {line}
                </div>
              ))}
            </div>
          );
        }

        return (
          <p key={index} className="text-[#efe8e2]">
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
        className={`max-w-[min(88%,54rem)] whitespace-pre-wrap px-5 py-4 text-[15px] leading-7 ${
          isUser
            ? "rounded-[24px] rounded-br-md bg-[#34302d] text-white"
            : "rounded-[26px] rounded-bl-md border border-[#6f6257]/10 bg-[linear-gradient(180deg,rgba(38,35,33,0.98),rgba(31,28,26,0.96))] text-[#eee7e1] shadow-[0_18px_40px_rgba(0,0,0,0.12)]"
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
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#bca48e]">
              <Sparkles size={13} />
              Analysis
            </div>
            {renderStructuredContent(displayContent)}
          </div>
        ) : (
          displayContent
        )}

        {message.report && (
          <div className="mt-4 rounded-[22px] border border-[#6f6257]/12 bg-black/22 p-4">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#bda792]">
              <FileText size={13} />
              Report Snapshot
            </div>
            <pre className="overflow-x-auto text-xs leading-6 text-[#ded4cb]">
              {message.report}
            </pre>
          </div>
        )}

        {imageFiles.length > 0 && (
          <div className="mt-4">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#bda792]">
              <ImageIcon size={13} />
              Plot Gallery
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {imageFiles.map((file, i) => (
                <a
                  key={i}
                  href={`${import.meta.env.VITE_API_URL}/download/${file}`}
                  download={file}
                  className="block overflow-hidden rounded-[20px] border border-[#6f6257]/12 bg-black/20 shadow-[0_14px_28px_rgba(0,0,0,0.14)]"
                >
                  <img
                    src={`${import.meta.env.VITE_API_URL}/download/${file}`}
                    alt={file}
                    className="h-auto w-full object-contain"
                  />
                  <div className="border-t border-white/6 px-3 py-2 text-xs text-[#cdb9a6]">
                    {file.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ")}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {allFiles.length > 0 && (
          <div className="mt-4">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#bda792]">
              <Download size={13} />
              Files
            </div>
            <div className="flex flex-wrap gap-2">
              {allFiles.map((file, i) => (
                <a
                  key={i}
                  href={`${import.meta.env.VITE_API_URL}/download/${file}`}
                  download={file}
                  className="inline-flex items-center rounded-full border border-[#6f6257]/16 bg-white/[0.04] px-3 py-1.5 text-xs text-[#dcc0a3] transition hover:bg-white/[0.06]"
                >
                  Download {file}
                </a>
              ))}
            </div>
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
