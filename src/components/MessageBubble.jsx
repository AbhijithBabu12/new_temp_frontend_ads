export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

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
          message.content
        )}
      </div>
    </div>
  );
}
