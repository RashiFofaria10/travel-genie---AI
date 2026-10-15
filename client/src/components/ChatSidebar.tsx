import { useState } from "react";
import {
  Plus,
  MessageSquare,
  Settings,
  User,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

type Chat = {
  id: number;
  title: string;
};

type Conversation = {
  id: number;
  title: string;
  messages: any[];
};

interface ChatSidebarProps {
  chats: Chat[];
  activeChat: number;
  onSelectChat: (id: number) => void;
  onNewChat: () => void;
  onDeleteChat: (id: number) => void;
  onRenameChat: (id: number, title: string) => void;
  conversations: Conversation[];
  setConversations: React.Dispatch<
    React.SetStateAction<Conversation[]>
  >;
}

export default function ChatSidebar({
  chats,
  activeChat,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
}: ChatSidebarProps) {
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  return (
    <aside className="w-72 h-full bg-white border-r border-pink-100 flex flex-col">

      {/* Header */}

      <div className="p-5 border-b border-pink-100">

        <button
          onClick={onNewChat}
          className="w-full rounded-xl bg-[#E78FB3] py-3 text-white flex items-center justify-center gap-2 hover:bg-pink-500 transition"
        >
          <Plus size={18} />
          New Chat
        </button>

      </div>

      {/* Chats */}

      <div className="flex-1 overflow-y-auto px-3 py-4">

        <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Chats
        </p>

        <div className="space-y-2">

          {chats.map((chat) => (

            <div
              key={chat.id}
              className={`relative rounded-xl group transition ${
                activeChat === chat.id
                  ? "bg-pink-100"
                  : "hover:bg-pink-50"
              }`}
            >

              <button
                onClick={() => onSelectChat(chat.id)}
                className="flex w-full items-center gap-3 px-3 py-3 text-left"
              >

                <MessageSquare
                  size={18}
                  className={
                    activeChat === chat.id
                      ? "text-[#E78FB3]"
                      : "text-gray-500"
                  }
                />

                <span
                  className={`truncate flex-1 ${
                    activeChat === chat.id
                      ? "text-[#E78FB3] font-medium"
                      : "text-gray-700"
                  }`}
                >
                  {chat.title}
                </span>

              </button>

              <button
                onClick={() =>
                  setOpenMenu(
                    openMenu === chat.id ? null : chat.id
                  )
                }
                className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 transition"
              >
                <MoreHorizontal size={18} />
              </button>

              {openMenu === chat.id && (

                <div className="absolute right-2 top-12 w-40 rounded-xl bg-white shadow-lg border z-50">

                  <button
                    onClick={() => {
                      const title = prompt(
                        "Rename chat",
                        chat.title
                      );

                      if (title && title.trim()) {
                        onRenameChat(chat.id, title);
                      }

                      setOpenMenu(null);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-3 hover:bg-pink-50"
                  >
                    <Pencil size={16} />
                    Rename
                  </button>

                  <button
                    onClick={() => {
                      onDeleteChat(chat.id);
                      setOpenMenu(null);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-3 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>

                </div>

              )}

            </div>

          ))}

        </div>

      </div>

      {/* Footer */}

      <div className="border-t border-pink-100 p-4 space-y-2">

        <button className="flex items-center gap-3 w-full rounded-xl p-3 hover:bg-pink-50">

          <User size={18} />

          Profile

        </button>

        <button className="flex items-center gap-3 w-full rounded-xl p-3 hover:bg-pink-50">

          <Settings size={18} />

          Settings

        </button>

      </div>

    </aside>
  );
}