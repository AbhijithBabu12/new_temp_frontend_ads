import { BarChart3, MessageSquareText } from "lucide-react";

const MODES = [
  {
    id: "chat",
    label: "Chat",
    hint: "Quick answers",
    icon: MessageSquareText,
    activeStyle:
      "bg-[linear-gradient(135deg,#f8fafc_0%,#dbeafe_100%)] text-[#16181d] shadow-[0_16px_32px_rgba(15,23,42,0.28)]",
    iconStyle: "bg-[#111827]/10 text-[#111827]"
  },
  {
    id: "data",
    label: "Data Science",
    hint: "Analyze datasets",
    icon: BarChart3,
    activeStyle:
      "bg-[linear-gradient(135deg,#67e8f9_0%,#60a5fa_45%,#818cf8_100%)] text-[#08111f] shadow-[0_16px_32px_rgba(37,99,235,0.28)]",
    iconStyle: "bg-[#08111f]/10 text-[#08111f]"
  }
];

export default function ModeToggle({ mode, switchMode }) {
  return (
    <div className="inline-flex items-center rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(44,44,48,0.96)_0%,rgba(28,28,32,0.94)_100%)] p-1.5 shadow-[0_22px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
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
                : "text-[#d0d2d8] hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                isActive
                  ? iconStyle
                  : "bg-white/6 text-[#aeb3c1] group-hover:bg-white/10 group-hover:text-white"
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
                  isActive ? "text-black/65" : "text-[#8f95a3]"
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
