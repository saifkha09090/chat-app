import Dashboard from "@/components/dashboard/Dashboard";
import { redirectNotAuth } from "@/lib/redirectNotAuth";

export default async function Home() {
  await redirectNotAuth();
  return (
    <Dashboard />
  );
}
