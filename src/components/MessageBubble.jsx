export default function MessageBubble({ message }) {
  return (
    <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
      <div className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm ${
        message.role === "user"
          ? "bg-[#2f2f31]"
          : "bg-[#282828]"
      }`}>
        {message.content === "__loading__" ? (
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
          </div>
        ) : (
          message.content
        )}
      </div>
    </div>
  );
}
