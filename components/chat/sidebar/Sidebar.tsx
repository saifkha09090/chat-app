"use client";

import { BiUserCircle } from "react-icons/bi";
import LogoutBtn from "../../buttons/LogoutBtn";
import { IoSearchSharp } from "react-icons/io5";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { MdOutlineDelete } from "react-icons/md";
import { CiCirclePlus } from "react-icons/ci";
import { UserModal } from "@/components/modal/UserModal";
import { SettingModal } from "@/components/modal/SettingModal";
import { ReceiveModal } from "@/components/modal/ReceiveModal";

type props = {
  setSelectedUser: any;
  setConversationId: any;
};

const Sidebar = ({ setSelectedUser, setConversationId }: props) => {
  const [search, setSearch] = useState("");
  const [searchUsers, setSearchUsers] = useState<any[] | null>([]);
  const [conversation, setConversation] = useState<any[] | null>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [myUsername, setMyUsername] = useState<string | null>(null);
  const [toggle, setToggle] = useState(false);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const { data: auth } = await supabase.auth.getUser();
    setMyId(auth.user?.id || null);
    fetchConversation(auth.user?.id);
    setMyUsername(auth.user?.user_metadata.username)
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

      console.log(data);
      

    setConversation(data || []);
  };

  const handleSearch = async () => {
    if (!search) {
      setSearchUsers([]);
      return;
    }

    const { data } = await supabase.from("profiles").select("*");
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

          const { data } = await supabase
            .from("conversations")
            .insert({
              user1: myId,
              user2: user.id,
            })
            .select()
            .single();

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

  const on = async () => {
    setToggle(!toggle);
    await supabase.from("profiles").update({ account_type: !toggle }).eq("id", myId)
  };

  return (
    <div className="w-1/3 px-3 bg-[#1a1919] text-white">
      <header className="flex justify-between items-center py-2">
        <h1 className="font-bold">Chat-app {myUsername}</h1>
        <LogoutBtn />
      </header>
      <main className="py-2 h-[86%]">
        <div className="flex items-center mb-2">
          <input
            type="text"
            name="searchBox"
            autoComplete="off"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border-r-0 rounded-lg text-black rounded-br-none rounded-tr-none bg-[#ededed] focus-visible:outline-none p-2.5"
            placeholder="Search user"
          />
          <div
            onClick={handleSearch}
            className="p-3.5 bg-[#ededed] text-black border-l-0 rounded-lg rounded-bl-none rounded-tl-none"
          >
            <IoSearchSharp />
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-2.5">
          {searchUsers?.map((user) => (
            <div
              key={user.id}
              onClick={() => openConversation(user)}
              className="flex items-center gap-4  cursor-pointer bg-[#333131] p-2 hover:bg-[#393737] rounded"
            >
              <div className="bg-blue-100 rounded-full">
                <BiUserCircle size={24} className="text-blue-500" />
              </div>
              <div>
                <p className="font-medium wrap-break-word">{user.username}</p>
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
                  className="flex justify-between bg-[#333131] items-center p-2 hover:bg-[#393737] rounded"
                >
                  <div
                    onClick={() => {
                      setSelectedUser(otherUser);
                      setConversationId(c.id);
                    }}
                    className="flex px-0.5 py-1.5 w-full items-center gap-3 cursor-pointer"
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
      <footer className="flex justify-end">
        <ReceiveModal myId={myId!} openConversation={openConversation} />
        <UserModal myId={myId!} openConversation={openConversation} />
        <SettingModal on={on} toggle={toggle} />
      </footer>
    </div>
  );
};

export default Sidebar;
