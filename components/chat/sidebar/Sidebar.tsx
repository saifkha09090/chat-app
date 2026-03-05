"use client";

import { BiUserCircle } from "react-icons/bi";
import LogoutBtn from "../../buttons/LogoutBtn";
import { IoSearchSharp } from "react-icons/io5";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { MdOutlineDelete } from "react-icons/md";

type props = {
  setSelectedUser: any;
  setConversationId: any;
};

const Sidebar = ({ setSelectedUser, setConversationId }: props) => {
  const [search, setSearch] = useState("");
  const [searchUsers, setSearchUsers] = useState<any[] | null>([]);
  const [conversation, setConversation] = useState<any[] | null>([]);
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const { data: auth } = await supabase.auth.getUser();
    setMyId(auth.user?.id || null);
    fetchConversation(auth.user?.id);
  };

  useEffect(() => {
    if (!myId) return;

    const channel = supabase
      .channel("conversation_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "conversations" },
        () => fetchConversation(myId),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [myId]);

  const fetchConversation = async (userId: string | undefined) => {
    const { data } = await supabase
      .from("conversations")
      .select(
        `*,user1_profile:profiles!conversations_user1_fkey(*),
        user2_profile:profiles!conversations_user2_fkey(*)`,
      )
      .or(`user1.eq.${userId},user2.eq.${userId}`);
      
    setConversation(data || []);
  };

  const handleSearch = async (value: string) => {
    setSearch(value);

    if (!value) {
      setSearchUsers([]);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .ilike("username", `%${value}%`);
    const filtered = data!.filter((id) => id.id !== myId);
    setSearchUsers(filtered);
  };

  const openConversation = async (user: any) => {
    setSelectedUser(user);

    // const { data } = await supabase
    //   .from("conversations")
    //   .select("*")
    //   .or(
    //     `and(user1.eq.${myId},user2.eq.${user.id}),and(user1.eq.${user.id},user2.eq.${myId})`,
    //   )
    //   .maybeSingle();

    
        // if (!cId) {
          const { data } = await supabase
            .from("conversations")
            .insert({
              user1: myId,
              user2: user.id,
            })
            .select()
            .single();
          // cId = data.id;
        // }

    if (data) {
      setConversationId(data.id);
    } else {
      setConversationId(null);
    }

    setSearch("");
    setSearchUsers([]);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", id);
    if (error) {
      console.log("error", error);
    }
    fetchConversation(myId!);
    setSelectedUser(null);
    setConversationId(null);
  };

  return (
    <div className="w-1/3 px-3 bg-[#282828] text-white">
      <header className="flex justify-between items-center py-2">
        <h1 className="">Chat-app</h1>
        <LogoutBtn />
      </header>
      <main className="py-2">
        <div className="flex items-center mb-2">
          <div className="p-3.5 bg-[#ededed] text-black border-r-0 rounded-lg rounded-br-none rounded-tr-none">
            <IoSearchSharp />
          </div>
          <input
            type="text"
            name="searchBox"
            autoComplete="off"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full border-l-0 rounded-lg text-black rounded-bl-none rounded-tl-none bg-[#ededed] focus-visible:outline-none p-2.5"
            placeholder="Search user"
          />
        </div>
        <div className="mt-3 flex flex-col gap-2.5">
          {searchUsers?.map((user) => (
            <div
              key={user.id}
              onClick={() => openConversation(user)}
              className="flex p-1 items-center gap-4 cursor-pointer hover:bg-gray-100 hover:text-black rounded-sm"
            >
              <div className="bg-blue-100 rounded-full">
                <BiUserCircle size={24} className="text-blue-500" />
              </div>
              <div>
                <p className="font-medium wrap-break-word">
                  {user.username}
                </p>
              </div>
            </div>
          ))}
          {!search &&
            conversation?.map((c) => {
              const otherUser =
                c.user1 === myId ? c.user2_profile : c.user1_profile;
              return (
                <div
                  key={c.id}
                  className="flex justify-between items-center p-2 hover:bg-gray-100 hover:text-black rounded"
                >
                  <div
                    onClick={() => {
                      setSelectedUser(otherUser);
                      setConversationId(c.id);
                    }}
                    className="flex w-full items-center gap-3 cursor-pointer"
                  >
                    <div className="bg-blue-100 rounded-full">
                <BiUserCircle size={24} className="text-blue-500" />
              </div>
                   <div>
                      <p className="font-medium wrap-break-word">
                        {otherUser?.username}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-red-500 text-sm cursor-pointer"
                  >
                    <MdOutlineDelete size={18} className="hover:text-red-400" />
                  </button>
                </div>
              );
            })}
        </div>
      </main>
    </div>
  );
};

export default Sidebar;
