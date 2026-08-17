import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Bot, Send, User, X } from "lucide-react";

interface ChatbotProps {
  disasterData: any[];
  onClose?: () => void;
}

const Chatbot = ({ disasterData, onClose }: ChatbotProps) => {
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "bot" }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const apiKey = import.meta.env.VITE_COHERE_ACCESS_TOKEN;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { text: input, sender: "user" as const };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Format disaster data into a readable summary
      const disasterSummary = disasterData.length
        ? disasterData
            .slice(0, 80) // Only send a few to prevent long prompts
            .map((event) => `${event.properties.eventtype}: ${event.properties.htmldescription}`)
            .join("\n")
        : "No disaster data available.";

      const response = await axios.post(
        "https://api.cohere.ai/v1/generate",
        {
          prompt: `You are a disaster response assistant. Based on the latest disaster events: ${disasterSummary}, answer the following: ${input}`,
          max_tokens: 100,
          model: "command-r-plus", // Choose a Cohere model that fits your needs
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const botMessage = {
        text: response.data.generations[0].text,
        sender: "bot" as const,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages((prev) => [...prev, { text: "Sorry, something went wrong.", sender: "bot" }]);
    }

    setLoading(false);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-panel">
      <div className="flex flex-shrink-0 items-center gap-2 border-b border-slate-200 bg-brand-500 px-4 py-3 text-white">
        <Bot size={18} />
        <p className="text-sm font-semibold">AI chat assistant</p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close assistant"
            className="ml-auto rounded p-1 transition hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto scrollbar-slim p-3">
        {messages.length === 0 && !loading && (
          <p className="p-3 text-center text-sm text-slate-500">
            Ask about the events currently on the map.
          </p>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end gap-2 ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender !== "user" && (
              <Bot size={22} className="mb-1 flex-shrink-0 text-slate-400" />
            )}

            <div
              className={`max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm ${
                msg.sender === "user"
                  ? "rounded-br-sm bg-brand-500 text-white"
                  : "rounded-bl-sm bg-slate-100 text-slate-800"
              }`}
            >
              {msg.text}
            </div>

            {msg.sender === "user" && (
              <User size={22} className="mb-1 flex-shrink-0 text-brand-500" />
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-end gap-2">
            <Bot size={22} className="mb-1 flex-shrink-0 text-slate-400" />
            <div className="animate-pulse rounded-2xl rounded-bl-sm bg-slate-100 px-3 py-2 text-sm text-slate-500">
              AI is typing…
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-shrink-0 items-center gap-2 border-t border-slate-200 bg-white p-3">
        <input
          type="text"
          className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          placeholder="Ask about a disaster…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          aria-label="Send message"
          className="flex-shrink-0 rounded-lg bg-brand-500 p-2 text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
