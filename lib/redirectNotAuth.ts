import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

export async function redirectNotAuth(path = '/login') {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data?.user) {
    redirect(path);
  }

  return data.user;
}