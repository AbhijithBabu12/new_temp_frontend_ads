export default function MessageBubble({ message }) {
  return (
    <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
      <div className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm ${
        message.role === "user"
          ? "bg-[#2f2f31]"
          : "bg-[#282828]"
      }`}>
        {message.content}
      </div>
    </div>
  );
}