import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase/client";
import { FormEvent, useState } from "react";
import { AiFillMessage } from "react-icons/ai";
import { BiUserCircle } from "react-icons/bi";
import { CiCirclePlus } from "react-icons/ci";
import { IoMdPersonAdd } from "react-icons/io";
import { IoSearchSharp } from "react-icons/io5";

export function UserModal({
  myId,
  openConversation,
}: {
  myId: string;
  openConversation: any;
}) {
  const [search, setSearch] = useState("");
  const [searchUsers, setSearchUsers] = useState<any[] | null>([]);
  const isValidEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!search) return setSearchUsers([]);

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .or(`email.eq.${search},username.eq.${search}`);

    const filtered = data!.filter((id) => id.id !== myId);
    setSearchUsers(filtered);
  };

  const sendInvite = async (id: string) => {
    const {error} = await supabase.from("invites").insert({
      sender_id : myId,
      receiver_id: id,
      status: "pending"
    })

    if(error){
      console.log(error)
    }
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="bg-[#333131] rounded-full text-blue-500">
          <CiCirclePlus size={30} className="cursor-pointer" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#1a1919] border-none text-white p-0 gap-0 rounded-md">
        <DialogHeader className="px-5 py-3 bg-[#202020] rounded-t-md">
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className="px-5 py-2">
          <form onSubmit={handleSearch} className="flex items-center mb-2">
            <input
              type="text"
              name="searchBox"
              autoComplete="off"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-r-0 rounded-lg text-black rounded-br-none rounded-tr-none bg-[#ededed] focus-visible:outline-none py-2.5 pl-3 pr-2"
              placeholder="Search user"
            />
            <button
              type="submit"
              className="p-3.5 bg-blue-500 border-l-0 rounded-lg rounded-bl-none rounded-tl-none cursor-pointer hover:bg-blue-400"
            >
              <IoSearchSharp />
            </button>
          </form>
          <div className="flex flex-col gap-2.5">
            {searchUsers?.map((user: any) => (
              <div
                key={user.id}
                className="flex justify-between bg-[#333131] items-center p-2 rounded"
              >
                <div className="flex px-0.5 py-1.5 w-full items-center gap-3">
                  <div className="bg-blue-100 rounded-full">
                    <BiUserCircle size={24} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium wrap-break-word">
                      {isValidEmail.test(search) ? user?.email : user?.username}
                    </p>
                  </div>
                </div>

                <button className=" text-sm cursor-pointer">
                  {user.account_type ? (
                    <DialogClose asChild>
                      <AiFillMessage
                        onClick={() => {
                          (openConversation(user), setSearchUsers([]), setSearch(""));
                        }}
                        size={18}
                        className="text-blue-500 hover:text-blue-400"
                      />
                    </DialogClose>
                  ) : (
                    <IoMdPersonAdd
                    onClick={() => sendInvite(user?.id)}
                      size={18}
                      className="text-green-500 hover:text-green-400"
                    />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter className="px-5 py-2">
          <DialogClose asChild>
            <button
              onClick={() => {
                (setSearchUsers([]), setSearch(""));
              }}
              className="font-semibold p-2 rounded-md sm:text-base bg-red-500 text-sm hover:bg-red-400 cursor-pointer"
            >
              Close
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
