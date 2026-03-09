"use client";

import { BiUserCircle } from "react-icons/bi";
import { IoSend } from "react-icons/io5";
import { FormEvent, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { MdOutlineClear } from "react-icons/md";
import { Message, User } from "@/types/type";

type props = {
  selectedUser: User;
  conversationId: string | null;
  setSelectedUser: any;
  setConversationId: any;
  open: boolean;
  setOpen: any;
};

const Messages = ({
  selectedUser,
  conversationId,
  setSelectedUser,
  open,
  setOpen,
}: props) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [myId, setMyId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const user =(await supabase.auth.getUser()).data.user;
    setMyId(user?.id || null);
  };

  useEffect(() => {
    if (!conversationId) return setMessages([]);

    fetchMessages();

    const channel = supabase
      .channel("chat")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const fetchMessages = async () => {
    if (!conversationId) return;

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    setMessages(data || []);
  };

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedUser) return;

    await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: myId,
      text: input,
    });

    setInput("");
  };

  const handleCancel = () => {
    setSelectedUser(null);
  };

  if (!selectedUser)
    return (
      <div className="relative w-2/3 hidden sm:block">
        <div className="absolute inset-0 bg-[url('/bg1.jpg')] bg-center before:absolute before:inset-0 before:bg-black/50"></div>
        <div className="relative z-10 h-full flex items-center justify-center ml-px border-l border-[#827d7d] text-white">
          Select a user to start chat
        </div>
      </div>
    );

  return (
    <>
      <div className="sm:w-2/3 sm:block hidden sm: w-full border-l border-[#636060] bg-black/50">
        <header className="flex justify-between items-center bg-[#1a1919] px-2.5 py-2">
          <div className="flex p-1 items-center gap-4 rounded-sm">
            <BiUserCircle size={24} className="text-blue-500" />
            <p className="text-white font-medium wrap-break-word">
              {selectedUser?.username || "user"}
            </p>
          </div>
          <button className="" onClick={handleCancel}>
            <MdOutlineClear className="text-white" />
          </button>
        </header>
        <div className="relative p-2 h-[92.5%]">
          <div className="absolute inset-0 bg-[url('/bg1.jpg')] bg-auto bg-center before:absolute before:inset-0 before:bg-black/50"></div>
          <div className="relative z-10 flex-1 overflow-y-auto py-3 space-y-2 h-[91%] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-xs md:max-w-md lg:max-w-lg wrap-break-word w-max rounded-lg p-3 shadow-md  ${
                  m.sender_id === myId
                    ? "bg-[#144d37] text-white ml-auto rounded-br-none"
                    : "bg-gray-200 rounded-bl-none"
                }`}
              >
                {m.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <footer className="relative z-10 pt-0.5">
            <form onSubmit={sendMessage} className="flex items-center mb-2">
              <input
                type="text"
                name="searchBox"
                autoComplete="off"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full bg-[#ededed] border-r-0 rounded-lg rounded-br-none rounded-tr-none border-2 border-[#dcd8d8] outline-none p-2.5"
                placeholder="Type a message"
              />
              <button
                type="submit"
                className={`border-2 bg-[#ededed] border-[#dcd8d8] border-l-0 rounded-lg rounded-bl-none rounded-tl-none  ${input !== "" ? "p-3.5 cursor-pointer" : "p-5.5"}`}
              >
                {input.trim() !== "" && <IoSend className="text-blue-500" />}
              </button>
            </form>
          </footer>
        </div>
      </div>

      <div
        className={`bg-black/50 sm:hidden block
         ${!open ? "w-full" : `hidden`}`}
      >
        <header className="flex justify-between items-center bg-[#1a1919] px-2.5 py-2">
          <div className="flex p-1 items-center gap-4 rounded-sm">
            <BiUserCircle size={24} className="text-blue-500" />
            <p className="text-white font-medium wrap-break-word">
              {selectedUser?.username || "user"}
            </p>
          </div>
          <button className="sm:block hidden" onClick={handleCancel}>
            <MdOutlineClear className="text-white" />
          </button>
          <button
            className="block sm:hidden"
            onClick={() => {
              handleCancel();
              setOpen(true);
            }}
          >
            <MdOutlineClear className="text-white" />
          </button>
        </header>
        <div className="relative p-2 h-[92.5%]">
          <div className="absolute inset-0 bg-[url('/bg1.jpg')] bg-auto bg-center before:absolute before:inset-0 before:bg-black/50"></div>
          <div className="relative z-10 flex-1 overflow-y-auto py-3 space-y-2 h-[91%] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-xs md:max-w-md lg:max-w-lg wrap-break-word w-max rounded-lg p-3 shadow-md  ${
                  m.sender_id === myId
                    ? "bg-[#144d37] text-white ml-auto rounded-br-none"
                    : "bg-gray-200 rounded-bl-none"
                }`}
              >
                {m.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <footer className="relative z-10 pt-0.5">
            <form onSubmit={sendMessage} className="flex items-center mb-2">
              <input
                type="text"
                name="searchBox"
                autoComplete="off"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full bg-[#ededed] border-r-0 rounded-lg rounded-br-none rounded-tr-none border-2 border-[#dcd8d8] outline-none p-2.5"
                placeholder="Type a message"
              />
              <button
                type="submit"
                className={`border-2 bg-[#ededed] border-[#dcd8d8] border-l-0 rounded-lg rounded-bl-none rounded-tl-none  ${input !== "" ? "p-3.5 cursor-pointer" : "p-5.5"}`}
              >
                {input !== "" && <IoSend className="text-blue-500" />}
              </button>
            </form>
          </footer>
        </div>
      </div>
    </>
  );
};

export default Messages;
