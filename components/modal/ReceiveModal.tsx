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
import { useEffect, useState } from "react";
import { BiUserCircle } from "react-icons/bi";
import { IoMdSettings } from "react-icons/io";

export function ReceiveModal({
  myId,
  openConversation,
}: {
  myId: string;
  openConversation: any;
}) {
  const [inviteUsers, setInviteUsers] = useState<any[] | null>([]);
  
  const fetchInvite = async () => {
    const user = await supabase.auth.getUser();
    const {data, error} = await supabase.from("invites").select("*, profiles!invites_receiver_id_fkey(*)").eq("receiver_id", user.data.user?.id)
    console.log(data);
    
    if (error) {
      console.log(error);
      return
    }
    setInviteUsers(data)
  }

  useEffect(() => {
    fetchInvite()
  }, [myId])

  const recieveInvite = async (user: any) => {
      const {data, error} = await supabase.from("invites").select("*, profiles!invites_receiver_id_fkey(*)").eq("sender_id", user.sender_id).single()
    await supabase.from("invites").update({ status: "accept"}).eq("id", user?.id)
    setInviteUsers((invite) => invite?.filter((i) => i?.id !== user?.id)!)
    openConversation(data)
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button>
          <IoMdSettings size={30} className="cursor-pointer" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#1a1919] border-none text-white p-0 gap-0 rounded-md">
        <DialogHeader className="px-5 py-3 bg-[#202020] rounded-t-md">
          <DialogTitle>Setting</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className="px-5 py-2">
          {inviteUsers?.map((user: any) => (
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
                                {user?.profiles.username}
                              </p>
                            </div>
                          </div>
          
                          <button onClick={() => recieveInvite(user)} className="bg-green-500 text-sm cursor-pointer">
                           Accept
                          </button>
                        </div>
                      ))}
        </div>
        <DialogFooter className="px-5 py-2">
          <DialogClose asChild>
            <button className="font-semibold p-2 rounded-md sm:text-base bg-red-500 text-sm hover:bg-red-400 cursor-pointer">
              Close
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
