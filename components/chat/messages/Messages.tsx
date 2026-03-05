"use client";

import { BiUserCircle } from "react-icons/bi";
import { IoSend } from "react-icons/io5";
import { FormEvent, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { MdOutlineClear } from "react-icons/md";
import wb from "@/public/wb.jpg"

type props = {
  selectedUser: any;
  conversationId: string | null;
  setSelectedUser: any;
};

const Messages = ({ selectedUser, conversationId, setSelectedUser }: props) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [myId, setMyId] = useState<string | null>(null);
   const audioRef = useRef<HTMLAudioElement | null>(null);

   useEffect(() => {
    audioRef.current = new Audio('/notification1.mp3');
  }, []);

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((error: any) => {
        console.error("Audio playback failed:", error);
      });
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const { data: auth } = await supabase.auth.getUser();
    setMyId(auth.user?.id || null);
  };

  useEffect(() => {
    if (!conversationId) return setMessages([]);

    fetchMessages()

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
          if (payload.new.sender_id !== myId) {
          playNotificationSound();
        }
          setMessages((prev) => [...prev, payload.new])
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const fetchMessages = async () => {
    if (!conversationId) return

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

    let cId = conversationId;

    await supabase.from("messages").insert({
      conversation_id: cId,
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
      <div className="w-2/3 flex items-center justify-center ml-px bg-[#282828] text-white">
        Select a user to start chat
      </div>
    );

  return (
    <div className="w-2/3 pl-px">
      <header className="flex justify-between items-center bg-[#282828] px-2.5 py-2">
        <div className="flex p-1 items-center gap-4 rounded-sm">
          <BiUserCircle size={24} className="text-blue-500" />
          <p className="text-white font-medium wrap-break-word">
            {selectedUser?.username || "user"}
          </p>
        </div>
        <button onClick={handleCancel}>
          <MdOutlineClear className="text-white" />
        </button>
      </header>
      <div style={{
        backgroundImage: `url('/db.jfif')`,
      }} className="p-2 h-[92.5%]">
        <div className="flex-1 overflow-y-auto py-3 space-y-2 h-[92%] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`p-2 rounded max-w-xs ${
                m.sender_id === myId
                  ? "bg-blue-500 text-white ml-auto"
                  : "bg-gray-200"
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>
      <footer className="pt-0.5">
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
  );
};

export default Messages;
