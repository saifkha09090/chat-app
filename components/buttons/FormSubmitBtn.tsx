"use client";

import { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type props = {
  children: ReactNode;
  pendingText?: string;
  className?: string;
};

export default function FormSubmitBtn({
  children,
  pendingText = "Working…",
  className = "",
}: props) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={
        `inline-flex w-3/5 items-center justify-center rounded-xl py-2 font-medium
         text-white focus:outline-none  cursor-pointer
         ${pending ? "bg-blue-500" : "bg-blue-600 hover:bg-blue-500"} ` +
        className
      }
    >
      {pending && (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
          />
        </svg>
      )}
      {pending ? pendingText : children}
    </button>
  );
}
