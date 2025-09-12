import { useState } from "react";
import axios from "axios";
import { Bot, User } from "lucide-react";

const Chatbot = ({ disasterData }: { disasterData: any[] }) => {
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "bot" }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const apiKey = import.meta.env.VITE_COHERE_ACCESS_TOKEN;

  const sendMessage = async () => {
    if (!input.trim()) return;
  
    const userMessage = { text: input, sender: "user" };
    setMessages((prev:any) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
  
    try {

        // Format disaster data into a readable summary
      const disasterSummary = disasterData.length
      ? disasterData
          .slice(0, 80) // Only send a few to prevent long prompts
          .map((event) => `${event.properties.eventtype}: ${event.properties.htmldescription}`)
          .join("\n")
      : "No disaster data available."
    //   console.log(disasterData)


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
  
      const botMessage = { text: response.data.generations[0].text, sender: "bot" };
      setMessages((prev:any) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages((prev) => [...prev, { text: "Sorry, something went wrong.", sender: "bot" }]);
    }
  
    setLoading(false);
  };
  

  return (
    <div className="flex flex-col max-h-[95%] bg-gray-100 text-black rounded-md shadow-lg p-2">
      <div className=" flex gap-2 items-center justify-center bg-blue-600 text-white py-3 text-center rounded-md">
        <p className="text-lg"> AI Chat Assistant</p>
      
      <Bot size={30} className="text-white" /></div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
      {messages.map((msg, index) => (
  <div 
    key={index} 
    className={`flex items-center gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
  >
    {/* Bot Icon (Left) */}
    {msg.sender !== "user" && <Bot size={30} className="text-gray-500" />}

    {/* Message Bubble */}
    <div 
      className={`p-4 m-2 max-w-xs rounded-xl ${msg.sender === "user" ? "bg-blue-500 text-white rounded-tr-sm rounded-2xl " : "bg-gray-200 text-gray-800 rounded-2xl  rounded-tl-sm"}`}
    >
      {msg.text}
    </div>

    {/* User Icon (Right) */}
    {msg.sender === "user" && <User size={30} className="text-blue-500" />}
  </div>
))}


        {loading && (
          <div className="flex justify-start">
            <div className="p-3 bg-gray-200 text-gray-800 rounded-xl animate-pulse">AI is typing...</div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white flex items-center gap-2 border-t">
        <input
          type="text"
          className="flex-1 p-2 border rounded-md"
          placeholder="Ask about a disaster..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white p-2 rounded-md">Send</button>
      </div>
    </div>
  );
};

export default Chatbot;
