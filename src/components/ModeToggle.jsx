import { BarChart3, MessageSquareText } from "lucide-react";

const MODES = [
  {
    id: "chat",
    label: "Chat",
    hint: "Quick answers",
    icon: MessageSquareText,
    activeStyle:
      "bg-[linear-gradient(135deg,#ecfdf5_0%,#d1fae5_100%)] text-[#102118] shadow-[0_16px_32px_rgba(5,46,22,0.24)]",
    iconStyle: "bg-[#14532d]/10 text-[#14532d]"
  },
  {
    id: "data",
    label: "Data Science",
    hint: "Analyze datasets",
    icon: BarChart3,
    activeStyle:
      "bg-[linear-gradient(135deg,#34d399_0%,#10b981_48%,#059669_100%)] text-[#06140e] shadow-[0_16px_32px_rgba(6,95,70,0.28)]",
    iconStyle: "bg-[#064e3b]/10 text-[#064e3b]"
  }
];

export default function ModeToggle({ mode, switchMode }) {
  return (
    <div className="inline-flex items-center rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(37,43,39,0.96)_0%,rgba(22,27,24,0.94)_100%)] p-1.5 shadow-[0_22px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
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
                : "text-[#d0d7d2] hover:bg-white/[0.05] hover:text-white"
            }`}
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                isActive
                  ? iconStyle
                  : "bg-white/6 text-[#aab5ad] group-hover:bg-white/10 group-hover:text-white"
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
                  isActive ? "text-black/60" : "text-[#8c968f]"
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
