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
        else throw new Error("Something went wrong — please try again.");
      }

      setStatus("success");
      setEmail("");
      toast.success("You are subscribed to RADAR!");
    } catch (e) {
      // keep the email so the reader can correct and retry
      setStatus("error");
      toast.error(e instanceof Error ? e.message : "An error occurred.");
    }
  };

  const isFooter = variant === "footer";

  if (isFooter) {
    // Footer variant: stacked layout with rectangular button
    return (
      <form onSubmit={handleSubmit} className={`w-full ${className}`}>
        <div className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john.doe@gmail.com"
            className="w-full px-4 py-3 bg-overlay text-content border border-edge rounded-md placeholder:text-content-subtle focus:outline-none focus:border-primary transition-colors text-sm"
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
    >
      <div className="flex items-center rounded-full bg-overlay border border-edge p-1.5 focus-within:border-primary transition-colors">
        {/* Email Input */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john.doe@student.babcock.edu.ng"
          className="flex-1 min-w-0 px-4 py-2 bg-transparent text-content placeholder:text-content-subtle focus:outline-none text-sm"
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
        className="w-full sm:hidden px-5 py-2.5 bg-primary text-white font-medium text-sm rounded-full hover:bg-primary-hover focus:outline-none disabled:opacity-50 transition-colors items-center gap-2 flex justify-center mt-2.5"
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
