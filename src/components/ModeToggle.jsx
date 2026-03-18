import { BarChart3, MessageSquareText } from "lucide-react";

const MODES = [
  {
    id: "chat",
    label: "Chat",
    hint: "Quick answers",
    icon: MessageSquareText,
    activeStyle:
      "bg-[linear-gradient(135deg,#f6efe7_0%,#e7d9ca_100%)] text-[#221b16] shadow-[0_16px_32px_rgba(54,40,28,0.2)]",
    iconStyle: "bg-[#6a5647]/10 text-[#5b493d]"
  },
  {
    id: "data",
    label: "Data Science",
    hint: "Analyze datasets",
    icon: BarChart3,
    activeStyle:
      "bg-[linear-gradient(135deg,#d8c2a7_0%,#b89573_48%,#927256_100%)] text-[#17110d] shadow-[0_16px_32px_rgba(84,59,37,0.24)]",
    iconStyle: "bg-[#4f3a2c]/10 text-[#4f3a2c]"
  }
];

export default function ModeToggle({ mode, switchMode }) {
  return (
    <div className="inline-flex items-center rounded-[28px] border border-[var(--toggle-border)] bg-[var(--toggle-shell)] p-1.5 shadow-[0_22px_50px_rgba(0,0,0,0.16)] backdrop-blur-xl transition-colors duration-300">
      {MODES.map(({ id, label, hint, icon: Icon, activeStyle, iconStyle }) => {
        const isActive = mode === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => switchMode(id)}
            className={`group relative flex min-w-[176px] items-center gap-3 rounded-[22px] px-4 py-3 text-left transition-all duration-300 ${
              isActive
                ? activeStyle
                : "text-[var(--toggle-text)] hover:bg-[var(--toggle-hover)] hover:text-[var(--toggle-hover-text)]"
            }`}
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                isActive
                  ? iconStyle
                  : "bg-[var(--toggle-icon-bg)] text-[var(--toggle-icon)] group-hover:bg-[var(--toggle-icon-hover-bg)] group-hover:text-[var(--toggle-hover-text)]"
              }`}
            >
              <Icon size={18} />
            </span>

            <span className="min-w-0">
              <span className="block truncate text-[14px] font-semibold tracking-[0.01em]">
                {label}
              </span>
              <span
                className={`block truncate text-[11px] leading-4 ${
                  isActive ? "text-black/58" : "text-[var(--toggle-muted)]"
                }`}
              >
                {hint}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
