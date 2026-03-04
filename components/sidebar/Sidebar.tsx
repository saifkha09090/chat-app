"use client";

import { BiUserCircle } from "react-icons/bi";
import LogoutBtn from "../buttons/LogoutBtn";
import { IoSearchSharp } from "react-icons/io5";
import { supabase } from "@/lib/supabase/client";
import { ChangeEvent, useEffect, useMemo, useState } from "react";

const Sidebar = () => {
  const [users, setUsers] = useState<any[] | null>([]);
  const [filter, setFilter] = useState<any[] | null>([]);
  const [search, setSearch] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    // const filtered = users!.filter((user) => user.username === value);
    // console.log(filtered);

    // setFilter(filtered);
  };
  const filteredUsers = useMemo(() => {
    return users!.filter((user) => {
      return (
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.name.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [users, search]);

  const fetchUsers = async () => {
    const { data } = await supabase.auth.getUser();
    const userId = data.user?.id;
    const { data: profile } = await supabase.from("profiles").select("*");
    const user = profile?.filter((id) => id.id !== userId);
    setUsers(user!);
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  return (
    <div className="w-1/3 pl-3">
      <header className="flex justify-between items-center py-2">
        <h1 className="">Chat-app</h1>
        <LogoutBtn />
      </header>
      <main className="py-2">
        <div className="flex items-center mb-2">
          <div className="p-3.5 border-2 border-[#dcd8d8] border-r-0 rounded-lg rounded-br-none rounded-tr-none">
            <IoSearchSharp />
          </div>
          <input
            type="text"
            name="searchBox"
            value={search}
            onChange={handleChange}
            className="w-full border-l-0 rounded-lg rounded-bl-none rounded-tl-none border-2 border-[#dcd8d8] focus-visible:outline-none p-2.5"
            placeholder="Search"
          />
        </div>
        <div className="mt-3 flex flex-col gap-2.5">
          {/* {users?.length === 0 && <div>users not found</div>} */}
          {filteredUsers?.map((user) => (
            <div
              key={user.id}
              className="flex p-1 items-center gap-4 cursor-pointer hover:bg-gray-100 rounded-sm"
            >
              <div className="bg-blue-100 rounded-full">
                <BiUserCircle className="w-7 h-7 text-blue-500" />
              </div>
              <div>
                <p className="text-gray-800 font-medium wrap-break-word">
                  {user.username}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Sidebar;
