"use server";

import { createActionClient } from "@/lib/supabase/actions";
import { supabase } from "@/lib/supabase/client";
import { redirect } from "next/navigation";

export async function LoginUser(formData: FormData) {
  const supabase = await createActionClient();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/");
}

export async function SignUp(formData: FormData) {
  const supabaseAction = await createActionClient();


  const userName = String(formData.get("userName") || "").trim();
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();

const { data: existingUserEmail, error: checkError } = await supabase
    .from('profiles')
    .select('email')
    .eq('email', email)
    .single();

  if (existingUserEmail) {
    return redirect(`/register?error=${encodeURIComponent("Email already exist")}`)
  }

  const { data: existingUserName } = await supabase
    .from('profiles')
    .select('email')
    .eq('username', userName)
    .single();

  if (existingUserName) {
    return redirect(`/register?error=${encodeURIComponent("Username already exist")}`)
  }
      
      const { error } = await supabaseAction.auth.signUp({
    email,
    password,
    options: { data: { username: userName, name: fullName } },
  });

  // console.log(p);
  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }
  
  redirect("/login");
}

export async function Logout() {
  const supabase = await createActionClient();
  await supabase.auth.signOut();
  redirect("/login");
}
