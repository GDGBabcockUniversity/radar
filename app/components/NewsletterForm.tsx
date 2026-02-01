"use client";

import { useState } from "react";
import { isValidEmail } from "../lib/utils";
import { toast } from "sonner";

interface NewsletterFormProps {
  variant?: "default" | "footer";
  className?: string;
}

export default function NewsletterForm({
  variant = "default",
  className = "",
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (!isValidEmail(email)) {
      toast.error("Invalid email.");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        if (res.status === 409)
          throw new Error("You are already subscribed to RADAR.");
        else throw new Error("Internal server error.");
      }

      setTimeout(() => {
        setStatus("success");
        setEmail("");
      }, 1000);

      toast.success("You are subscribed to RADAR!");
    } catch (e) {
      setTimeout(() => {
        setStatus("error");
        setEmail("");
      }, 1000);

      alert(e ? e : "An error occured.");
    }
  };

  const isFooter = variant === "footer";

  if (isFooter) {
    // Footer variant: stacked layout with rectangular button
    return (
      <form
        onSubmit={handleSubmit}
        className={`w-full ${className}`}
        style={{ fontFamily: "var(--font-body)" }}
      >
        <div className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john.doe@gmail.com"
            className="w-full px-4 py-3 bg-white/5 text-white border border-white/10 rounded-md placeholder:text-gray-500 focus:outline-none focus:border-primary transition-colors text-sm"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full px-4 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-hover focus:outline-none disabled:opacity-50 transition-colors text-sm inline-flex items-center justify-center gap-2"
          >
            {status === "success" ? "Subscribed!" : "Subscribe Now"}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </form>
    );
  }

  // Default variant: inline input + button
  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full max-w-md mx-auto ${className}`}
      style={{ fontFamily: "var(--font-body)" }}
    >
      <div className="flex items-center rounded-md sm:rounded-full bg-white/5 border border-white/10 p-1.5">
        {/* Email Icon */}
        <div className="pl-3 text-gray-500">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Email Input */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john.doe@gmail.com"
          className="flex-1 px-3 py-2 bg-transparent text-white placeholder:text-gray-500 focus:outline-none text-sm"
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status === "loading"}
          className="hidden sm:inline-flex px-5 py-2 bg-primary text-white font-medium text-sm rounded-full hover:bg-primary-hover focus:outline-none disabled:opacity-50 transition-colors items-center gap-2"
        >
          {status === "success" ? "Subscribed" : "Subscribe"}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full sm:hidden px-5 py-3 bg-primary text-white font-medium text-sm rounded-md hover:bg-primary-hover focus:outline-none disabled:opacity-50 transition-colors items-center gap-2 flex justify-center mt-3"
      >
        {status === "success" ? "Subscribed" : "Subscribe"}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </form>
  );
}
