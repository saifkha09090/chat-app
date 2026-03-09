"use client";

import Link from "next/link";
import FormSubmitBtn from "../buttons/FormSubmitBtn";
import { SignUp } from "@/app/(auth)/action";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase/client";

const Register = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasShownToast = useRef(false);

  // const fetch = async () => {
   
  // };

  useEffect(() => {
    const error = searchParams.get("error");
    // fetch()

    if (error && !hasShownToast.current) {
      hasShownToast.current = true;

      toast.error(error);

      const params = new URLSearchParams(searchParams.toString());
      params.delete("error");
      router.replace(`/register?${params.toString()}`);
    }
  }, [searchParams, router]);
  return (
    <div className="h-screen bg-[#1a1919] text-white flex items-center justify-center">
      <div className="bg-[#333131] m-5 p-6 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl pb-4 text-center font-bold">
          Sign Up
        </h2>
        <form action={SignUp}>
          <div className="mb-1">
            <label
              htmlFor="userName"
              className="block text-sm font-medium pl-2 mb-1"
            >
              Username
            </label>
            <input
              type="userName"
              id="userName"
              name="userName"
              placeholder="Enter your username"
              required
              autoComplete="off"
              className="w-full mb-2 rounded-lg ring-2 ring-[#dcd8d8] focus-visible:outline-none px-2.5 py-2.5"
            />
          </div>
          <div className="mb-1">
            <label
              htmlFor="Fullname"
              className="block text-sm font-medium pl-2 mb-1"
            >
              Full name
            </label>
            <input
              type="fullName"
              id="fullName"
              name="fullName"
              placeholder="Enter your full name"
              required
              autoComplete="off"
              className="w-full mb-2 rounded-lg ring-2  ring-[#dcd8d8] focus-visible:outline-none px-2.5 py-2.5"
            />
          </div>
          <div className="mb-1">
            <label
              htmlFor="email"
              className="block text-sm font-medium pl-2 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              required
              autoComplete="off"
              className="w-full mb-2 rounded-lg ring-2  ring-[#dcd8d8] focus-visible:outline-none px-2.5 py-2.5"
            />
          </div>
          <div className="mb-1">
            <label
              htmlFor="password"
              className="block text-sm font-medium pl-2 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              autoComplete="off"
              placeholder="Enter your password"
              className="w-full mb-2 rounded-lg ring-2  ring-[#dcd8d8] focus-visible:outline-none px-2.5 py-2.5"
            />
          </div>

          <div className="pt-2 text-center">
            <FormSubmitBtn pendingText="Sign up...">Sign up</FormSubmitBtn>
          </div>

          <p className="text-center text-sm mt-2">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-500 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
