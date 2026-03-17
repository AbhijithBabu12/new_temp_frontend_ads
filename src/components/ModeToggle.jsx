export default function ModeToggle({ mode, switchMode }) {
  return (
    <div className="flex justify-center gap-4 py-4">

      <button
        onClick={() => switchMode("chat")}
        className={`px-4 py-2 rounded-xl ${
          mode === "chat" ? "bg-blue-600" : "bg-[#3a3a3a]"
        }`}
      >
        Chat Mode
      </button>

      <button
        onClick={() => switchMode("data")}
        className={`px-4 py-2 rounded-xl ${
          mode === "data" ? "bg-blue-600" : "bg-[#3a3a3a]"
        }`}
      >
        Data Scientist Mode
      </button>

    </div>
  );
}