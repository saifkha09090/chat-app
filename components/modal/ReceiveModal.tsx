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
import { User } from "@/types/type";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BiUserCircle } from "react-icons/bi";
import { IoIosNotifications } from "react-icons/io";

export function ReceiveModal({ openConversation }: { openConversation: any }) {
  const [inviteUsers, setInviteUsers] = useState<User[] | null>([]);
  const [myId, setMyId] = useState<string | null>(null);


  const getUser = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    setMyId(user?.id || null);
  };

  useEffect(() => {
    getUser();
  }, []);

  const fetchInvite = async () => {
    const { data, error } = await supabase
      .from("invites")
      .select("*, profiles!invites_sender_id_fkey(*)")
      .eq("receiver_id", myId)
      .eq("status", "pending");

    if (error) {
      console.log(error);
      return;
    }
    setInviteUsers(data);
  };

  useEffect(() => {
    if (!myId) return;

    fetchInvite();

    const channel = supabase
      .channel(`invites-realtime-${myId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "invites",
          filter: `receiver_id=eq.${myId}`,
        },
        () => fetchInvite(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [myId]);

  const acceptInvite = async (user: any) => {
    await supabase
      .from("invites")
      .update({ status: "accept" })
      .eq("id", user?.id);

    await supabase.from("invites").upsert({
      sender_id: myId,
      receiver_id: user.sender_id,
      status: "accept",
    });

    setInviteUsers((invite) => invite?.filter((i) => i?.id !== user?.id)!);

    openConversation({
      id: user?.sender_id,
      username: user?.profiles.username,
    });

    toast.success("Invitation accepted");
  };
  const rejectInvite = async (user: User) => {
    await supabase.from("invites").delete().eq("id", user?.id);
    setInviteUsers((invite) => invite?.filter((i) => i?.id !== user?.id)!);
    fetchInvite();
    toast.success("Inivitation rejected");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="relative">
          {inviteUsers?.length !== 0 && (
            <div className="absolute -top-2 -right-0.5 text-xs bg-[#636363] h-4.5 w-4.5 rounded-full">
              {inviteUsers?.length}
            </div>
          )}
          <IoIosNotifications
            size={30}
            className="cursor-pointer text-[#ededed]"
          />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#1a1919] border-none text-white p-0 gap-0 rounded-md">
        <DialogHeader className="px-5 py-3 bg-[#202020] rounded-t-md">
          <DialogTitle>Request</DialogTitle>
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

              <DialogClose asChild>
                <button
                  onClick={() => acceptInvite(user)}
                  className="px-4 py-1.5 bg-green-600 text-white 
                                    rounded-lg text-sm hover:bg-green-500 
                                    transition-all duration-200 cursor-pointer"
                >
                  Accept
                </button>
              </DialogClose>
              <DialogClose asChild>
                <button
                  onClick={() => rejectInvite(user)}
                  className="px-4 ml-1 py-1.5 bg-red-600 text-white 
                  rounded-lg text-sm hover:bg-red-500 
                  transition-all duration-200 cursor-pointer"
                >
                  Reject
                </button>
              </DialogClose>
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
