import React, { useState, useRef, useEffect } from "react";
import ModelSelector from "./ModelSelector";
import { askAI } from "../utils/api";

const AIChat = ({ fileData, fileStats }) => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I can help you analyze your data. What would you like to know about it?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-3.5-turbo");
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = document.getElementById("chat-input");
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e) => {
    e.preventDefault();

    if (!input.trim() || isLoading || !fileData) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Get data summary for context
      const dataSummary = {
        rowCount: fileStats.row_count,
        columnCount: fileStats.column_count,
        columns: fileStats.columns || [],
        columnTypes: fileStats.column_types || {},
      };

      // Send message to API
      const response = await askAI(
        userMessage.content,
        selectedModel,
        dataSummary
      );

      // Add response to chat
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.answer,
        },
      ]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an error while processing your request. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const suggestedQuestions = [
    "What are the main insights from this dataset?",
    "Can you find any anomalies or outliers?",
    "What correlations exist between variables?",
    "What trends can you identify in this data?",
    "How is this data distributed?",
  ];

  return (
    <div className="card h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">AI Data Analyzer</h2>
        <ModelSelector
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
        />
      </div>

      <div className="flex-grow flex flex-col overflow-hidden">
        <div className="flex-grow overflow-y-auto mb-4 pr-1">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-3/4 rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-violet-600 text-white rounded-br-none"
                      : "bg-gray-700 text-gray-200 rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-gray-200 rounded-lg rounded-bl-none px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <div className="animate-bounce h-2 w-2 bg-gray-400 rounded-full"></div>
                    <div
                      className="animate-bounce h-2 w-2 bg-gray-400 rounded-full"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="animate-bounce h-2 w-2 bg-gray-400 rounded-full"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {!fileData ? (
          <div className="text-center p-4 bg-gray-700/30 rounded-lg">
            <p className="text-gray-400">
              Please upload a file to chat with AI
            </p>
          </div>
        ) : (
          <>
            {messages.length === 1 && !isLoading && (
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInput(question);
                        setTimeout(
                          () => document.getElementById("chat-input").focus(),
                          0
                        );
                      }}
                      className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-full transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSend} className="flex items-center space-x-2">
              <div className="flex-grow relative">
                <textarea
                  id="chat-input"
                  className="input w-full resize-none overflow-hidden py-3 pr-10"
                  placeholder="Ask me about your data..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  style={{ minHeight: "46px", maxHeight: "100px" }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={`absolute right-2 top-2/5 transform -translate-y-1/2 text-gray-400 
                    ${
                      !input.trim() || isLoading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:text-violet-400"
                    }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AIChat;
