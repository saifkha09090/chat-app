import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createActionClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookies) {
          cookies.forEach(c =>
            cookieStore.set(c.name, c.value, c.options)
          );
        },
      },
    }
  );
}