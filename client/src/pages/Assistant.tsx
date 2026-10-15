import { askAssistant } from "../services/assistantService";
import { useState, useEffect, useRef } from "react";
import ChatSidebar from "../components/ChatSidebar";
import ReactMarkdown from "react-markdown";
import { Sparkles, Send, Bot, User } from "lucide-react";

type Message = {
  type: "user" | "bot";
  text: string;
};

type Conversation = {
  id: number;
  title: string;
  messages: Message[];
};

const STORAGE_KEY = "travel-genie-chats";

const createNewChat = (): Conversation => ({
  id: Date.now(),
  title: "New Chat",
  messages: [
    {
      type: "bot",
      text: "👋 Hello! I'm Travel Genie AI. Ask me anything about your next trip.",
    },
  ],
});

function loadSavedConversations(): Conversation[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed: Conversation[] = JSON.parse(saved);

      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        parsed.every(
          (chat) =>
            typeof chat.id === "number" &&
            typeof chat.title === "string" &&
            Array.isArray(chat.messages)
        )
      ) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Failed to load saved chats:", error);
  }

  return [createNewChat()];
}

export default function Assistant() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Load history before the first render to prevent overwriting saved chats.
  const [conversations, setConversations] =
    useState<Conversation[]>(loadSavedConversations);

  const [activeChat, setActiveChat] = useState<number>(
    () => conversations[0]?.id ?? Date.now()
  );

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const activeConversation =
    conversations.find((chat) => chat.id === activeChat) ??
    conversations[0];

  useEffect(() => {
    // Keep window locked to the top
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // Scroll only within the message box, NEVER the window or footer
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [conversations, loading, activeChat]);

  // Save every conversation update to localStorage.
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(conversations)
      );
    } catch (error) {
      console.error("Failed to save chats:", error);
    }
  }, [conversations]);

  const handleNewChat = () => {
    const chat = createNewChat();

    setConversations((prev) => [chat, ...prev]);
    setActiveChat(chat.id);
    setMessage("");
  };

  const handleDeleteChat = (id: number) => {
    const updated = conversations.filter((chat) => chat.id !== id);

    if (updated.length === 0) {
      const newChat = createNewChat();

      setConversations([newChat]);
      setActiveChat(newChat.id);
      setMessage("");
      return;
    }

    setConversations(updated);

    if (activeChat === id) {
      setActiveChat(updated[0].id);
    }
  };

  const handleRenameChat = (id: number, newTitle: string) => {
    setConversations((prev) =>
      prev.map((chat) =>
        chat.id === id
          ? { ...chat, title: newTitle }
          : chat
      )
    );
  };

  const handleSend = async () => {
    const text = message.trim();

    if (!text || loading || !activeConversation) return;

    const chatId = activeChat;

    const userMessage: Message = {
      type: "user",
      text,
    };

    const updatedMessages = [
      ...activeConversation.messages,
      userMessage,
    ];

    // Save the user's message immediately.
    setConversations((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              title:
                chat.title === "New Chat"
                  ? text.substring(0, 25)
                  : chat.title,
              messages: updatedMessages,
            }
          : chat
      )
    );

    setMessage("");
    setLoading(true);

    try {
      const reply = await askAssistant(updatedMessages);

      // Attach the response to the conversation that sent the request.
      setConversations((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  {
                    type: "bot",
                    text: reply,
                  },
                ],
              }
            : chat
        )
      );
    } catch (error) {
      console.error("Assistant error:", error);

      setConversations((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  {
                    type: "bot",
                    text: "❌ Sorry, I couldn't process your request. Please try again.",
                  },
                ],
              }
            : chat
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-gradient-to-b from-pink-50/60 via-white to-pink-50/30 overflow-hidden">
      <ChatSidebar
        chats={conversations.map((chat) => ({
          id: chat.id,
          title: chat.title,
        }))}
        activeChat={activeChat}
        onSelectChat={(id) => {
          setActiveChat(id);
          setMessage("");
        }}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        conversations={conversations}
        setConversations={setConversations}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <section className="px-6 pt-3 pb-2 sm:px-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-gray-900">
              Travel <span className="text-[#E78FB3]">Assistant</span>
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-100 px-3 py-0.5 text-xs font-semibold text-[#E78FB3]">
              <Sparkles size={13} /> AI Powered
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-500">
            Ask anything about destinations, visas, hotels, budgets, or custom itineraries.
          </p>
        </section>

        {/* Chat Area */}
        <section className="flex-1 overflow-hidden px-4 pb-4 sm:px-8">
          <div className="flex h-full flex-col rounded-3xl sm:rounded-[35px] bg-white shadow-xl shadow-pink-100/50 border border-pink-100/60 overflow-hidden">
            <div
              ref={messagesContainerRef}
              className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-7"
            >
              {activeConversation?.messages.map((chat, index) => (
                <div
                  key={`${activeConversation.id}-${index}`}
                  className={`flex ${
                    chat.type === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`flex max-w-3xl gap-4 rounded-3xl p-5 ${
                      chat.type === "user"
                        ? "bg-[#E78FB3] text-white"
                        : "bg-pink-50 text-gray-800"
                    }`}
                  >
                    {chat.type === "bot" ? (
                      <Bot className="shrink-0 text-[#E78FB3]" />
                    ) : (
                      <User className="shrink-0" />
                    )}

                    <div className="min-w-0 max-w-full break-words">
                      <div className="prose max-w-none prose-p:my-2 prose-headings:my-3 prose-li:my-1">
                        <ReactMarkdown
                          components={{
                            table: ({ children }) => (
                              <div className="my-4 max-w-full overflow-x-auto">
                                <table className="w-full border-collapse text-sm">
                                  {children}
                                </table>
                              </div>
                            ),
                            thead: ({ children }) => (
                              <thead className="bg-pink-100">
                                {children}
                              </thead>
                            ),
                            th: ({ children }) => (
                              <th className="border border-pink-200 px-3 py-2 text-left font-semibold">
                                {children}
                              </th>
                            ),
                            td: ({ children }) => (
                              <td className="border border-pink-100 px-3 py-2 align-top">
                                {children}
                              </td>
                            ),
                            h1: ({ children }) => (
                              <h1 className="mb-4 mt-2 text-2xl font-bold text-[#E78FB3]">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="mb-3 mt-6 text-xl font-bold text-gray-800">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="mb-2 mt-4 text-lg font-semibold text-gray-800">
                                {children}
                              </h3>
                            ),
                          }}
                        >
                          {chat.text
                            .replace(/\\\|/g, "|")
                            .replace(/<br\s*\/?>/gi, "\n")}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-3xl bg-pink-50 p-5">
                    🤖 Travel Genie is typing...
                  </div>
                </div>
              )}

              {/* Messages scroll smoothly inside this container */}
            </div>

            {/* Input */}
            <div className="border-t border-pink-100 p-4 sm:p-5 bg-white">
              <div className="flex gap-3">
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask Travel Genie anything..."
                  className="min-w-0 flex-1 rounded-2xl border border-pink-100 bg-[#fffafd] p-3.5 text-sm text-gray-900 outline-none focus:border-[#E78FB3] focus:ring-2 focus:ring-pink-100 transition"
                />

                <button
                  onClick={handleSend}
                  disabled={loading || !message.trim()}
                  aria-label="Send message"
                  className="inline-flex items-center justify-center rounded-2xl bg-[#E78FB3] px-6 text-white transition hover:bg-pink-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}