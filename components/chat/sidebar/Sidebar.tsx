"use client";

import { BiUserCircle } from "react-icons/bi";
import LogoutBtn from "../../buttons/LogoutBtn";
import { IoSearchSharp } from "react-icons/io5";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { MdOutlineDelete } from "react-icons/md";
import { UserModal } from "@/components/modal/UserModal";
import { SettingModal } from "@/components/modal/SettingModal";
import { ReceiveModal } from "../../modal/ReceiveModal";
import { Conversation } from "@/types/type";

type props = {
  setSelectedUser: any;
  setConversationId: any;
  open: boolean;
  setOpen: any;
};

const Sidebar = ({
  setSelectedUser,
  setConversationId,
  open,
  setOpen,
}: props) => {
  const [search, setSearch] = useState("");
  const [searchUsers, setSearchUsers] = useState<any[] | null>([]);
  const [conversations, setConversations] = useState<Conversation[] | null>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [myUsername, setMyUsername] = useState<string | null>(null);
  const [toggle, setToggle] = useState();

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    setMyId(user?.id || null);
    fetchConversation(user?.id);
    setMyUsername(user?.user_metadata.username);
  };

  useEffect(() => {
    if (!myId) return;

    getToggleVal();
    const channel = supabase
      .channel("conversation_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => fetchConversation(myId),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [myId]);

  const fetchConversation = async (myId: string | undefined) => {
    if (!myId) return;
    const { data } = await supabase
      .from("conversations")
      .select(
        `*,user1_profile:profiles!conversations_user1_fkey(*),
        user2_profile:profiles!conversations_user2_fkey(*)`,
      )
      .order("created_at", { ascending: false })
      .or(`user1.eq.${myId},user2.eq.${myId}`);

    setConversations(data || []);
  };

  const handleSearch = async (value: string) => {
    setSearch(value);

    if (value === "") return setSearchUsers([]);

    const { data } = await supabase
      .from("invites")
      .select(
        `sender_id,receiver_id,
       sender:profiles!invites_sender_id_fkey(*),
       receiver:profiles!invites_receiver_id_fkey(*)`,
      )
      .eq("status", "accept")
      .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`);

    if (!data) return;

    const users = data.map((i: any) =>
      i.sender_id === myId ? i.receiver : i.sender,
    );

    const uniqueUsers = Array.from(
      new Map(users.map((u: any) => [u.id, u])).values(),
    );

    const filtered = uniqueUsers.filter((u: any) => u.username.includes(value));

    if (value !== "") return setSearchUsers(filtered);
  };

  const openConversation = async (user: any) => {
    setSelectedUser(user);

    const { data: existing } = await supabase
      .from("conversations")
      .select("id, user1, user2")
      .or(
        `and(user1.eq.${myId},user2.eq.${user.id}),and(user1.eq.${user.id},user2.eq.${myId})`,
      )
      .maybeSingle();

    if (existing) {
      setConversationId(existing.id);
    } else {
      const { data } = await supabase
        .from("conversations")
        .insert({
          user1: myId,
          user2: user.id,
        })
        .select()
        .single();

      setConversationId(data.id);
    }

    fetchConversation(myId!);
    setSearch("");
    setSearchUsers([]);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", id);

    if (!error) {
      setSelectedUser(null);
      setConversationId(null);
      fetchConversation(myId!);
    }
  };

  const getToggleVal = async () => {
    if (!myId) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("account_type")
      .eq("id", myId)
      .single();

    if (!error && data) {
      setToggle(data.account_type);
    }
  };

  const on = async () => {
    const newValue = !toggle;
    const { data } = await supabase
      .from("profiles")
      .update({ account_type: newValue })
      .eq("id", myId)
      .select()
      .single();

    setToggle(data.account_type);
  };

  return (
    <>
      <div className="sm:w-1/3 sm:block hidden px-3 bg-[#1a1919] text-white">
        <header className="flex justify-between items-center py-2">
          <h1 className="font-bold">{myUsername}</h1>
          <LogoutBtn />
        </header>
        <main className="py-2 h-[86%]">
          <div className="flex items-center mb-2">
            <input
              type="text"
              name="searchBox"
              autoComplete="off"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full border-r-0 rounded-lg text-black rounded-br-none rounded-tr-none bg-[#ededed] focus-visible:outline-none p-2.5"
              placeholder="Search user"
            />
            <button className="p-3.5 bg-[#ededed] text-black border-l-0 rounded-lg rounded-bl-none rounded-tl-none">
              <IoSearchSharp />
            </button>
          </div>
          <div className="mt-3 flex flex-col gap-2.5 h-[88%] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {searchUsers?.map((user) => (
              <div key={user?.id}>
                <div
                  onClick={() => openConversation(user)}
                  className="sm:flex hidden items-center gap-4  cursor-pointer bg-[#333131] p-3 hover:bg-[#393737] rounded"
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
              </div>
            ))}
            {!search &&
              conversations?.map((c) => {
                const otherUser =
                  c.user1 === myId ? c.user2_profile : c.user1_profile;
                return (
                  <div key={c.id}>
                    <div className="sm:flex hidden justify-between bg-[#333131] items-center p-2 hover:bg-[#393737] rounded">
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
                        <MdOutlineDelete
                          size={18}
                          className="hover:text-red-400"
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </main>
        <footer className="flex justify-center gap-2">
          <ReceiveModal openConversation={openConversation} />
          <UserModal openConversation={openConversation} />
          <SettingModal on={on} toggle={toggle} />
        </footer>
      </div>

      <div
        className={`sm:hidden px-3 bg-[#1a1919] text-white ${open ? "w-full" : `hidden`}`}
      >
        <header className="flex justify-between items-center py-2">
          <h1 className="font-bold">{myUsername}</h1>
          <LogoutBtn />
        </header>
        <main className="py-2 h-[86%]">
          <div className="flex items-center mb-2">
            <input
              type="text"
              name="searchBox"
              autoComplete="off"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full border-r-0 rounded-lg text-black rounded-br-none rounded-tr-none bg-[#ededed] focus-visible:outline-none p-2.5"
              placeholder="Search user"
            />
            <button className="p-3.5 bg-[#ededed] text-black border-l-0 rounded-lg rounded-bl-none rounded-tl-none">
              <IoSearchSharp />
            </button>
          </div>
          <div className="mt-3 flex flex-col gap-2.5 h-[88%] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {searchUsers?.map((user) => (
              <div key={user.id}>
                <div
                  onClick={() => {
                    openConversation(user);
                    setOpen(false);
                  }}
                  className="flex sm:hidden items-center gap-4  cursor-pointer bg-[#333131] p-3 hover:bg-[#393737] rounded"
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
              </div>
            ))}
            {!search &&
              conversations?.map((c) => {
                const otherUser =
                  c.user1 === myId ? c.user2_profile : c.user1_profile;
                return (
                  <div key={c.id}>
                    <div className="flex sm:hidden justify-between bg-[#333131] items-center p-2 hover:bg-[#393737] rounded">
                      <div
                        onClick={() => {
                          setSelectedUser(otherUser);
                          setConversationId(c.id);
                          setOpen(false);
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
                        <MdOutlineDelete
                          size={18}
                          className="hover:text-red-400"
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </main>
        <footer className="flex justify-center gap-2">
          <ReceiveModal openConversation={openConversation} />
          <UserModal openConversation={openConversation} />
          <SettingModal on={on} toggle={toggle} />
        </footer>
      </div>
    </>
  );
};

export default Sidebar;
