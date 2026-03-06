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
import { FaToggleOff, FaToggleOn } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";

export function SettingModal({on, toggle}: any) {
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
          <div className="flex items-center justify-between">
            <p>Account {toggle ? "private" : "public"}</p>
            <button className="text-blue-500" onClick={on}>
              {toggle ? <FaToggleOn size={30} /> : <FaToggleOff size={30} />}
            </button>
          </div>
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
