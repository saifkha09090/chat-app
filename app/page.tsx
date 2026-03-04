import Messages from "@/components/messages/Messages";
import Sidebar from "@/components/sidebar/Sidebar";
import { redirectNotAuth } from "@/lib/redirectNotAuth";

export default async function Home() {
  await redirectNotAuth()
  return (
    <div className='h-screen flex'>
      <Sidebar />
      <Messages />
    </div>
  );
}
