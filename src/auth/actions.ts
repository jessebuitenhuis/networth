"use server";

import { redirect } from "next/navigation";

import { getSupabaseServerClient } from "./supabaseServerClient";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };

  redirect("/");
}

export async function register(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) return { error: error.message };

  return { success: true };
}

export async function forgotPassword(formData: FormData, origin: string) {
  const email = formData.get("email") as string;

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback`,
  });

  if (error) return { error: error.message };

  return { success: true };
}

export async function loginWithOAuth(origin: string) {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) return { error: error.message };

  redirect(data.url);
}

export async function logout() {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
