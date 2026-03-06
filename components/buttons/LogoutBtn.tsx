import { Logout } from "@/app/(auth)/action";
import { FiLogOut } from "react-icons/fi";

export default function LogoutBtn() {
  return (
    <form>
      <button
        className="flex items-center font-semibold p-2 bg-[#dd000b] text-white rounded-md sm:text-base text-sm hover:bg-red-500 cursor-pointer"
        formAction={Logout}
      >
        <FiLogOut />
      </button>
    </form>
  );
}