"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useAccess } from "@/context/AccessContext";

type AccessMode = "guest" | "admin";

type AccessGateProps = {
  children: ReactNode;
};

type VerifyResponse =
  | { success: true; role: "guest"; token?: string }
  | { success: true; role: "admin"; token: string }
  | { success: false };

export function AccessGate({ children }: AccessGateProps) {
  const { role, setAccess } = useAccess();
  const [mode, setMode] = useState<AccessMode>("guest");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: mode, password }),
      });

      if (!response.ok) {
        setError("Incorrect password. Please try again or contact the owner.");
        return;
      }

      const data = (await response.json()) as VerifyResponse;
      if (data.success) {
        setAccess(data.role, data.token ?? null);
        setPassword("");
      } else {
        setError("Incorrect password. Please try again or contact the owner.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to verify password. Please try again shortly.");
    } finally {
      setPending(false);
    }
  };

  if (role === "guest" || role === "admin") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-slate-50">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg backdrop-blur">
        <div className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("guest");
              setError(null);
              setPassword("");
            }}
            className={`flex-1 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
              mode === "guest"
                ? "bg-sky-400 text-slate-950"
                : "text-slate-200 hover:text-white"
            }`}
          >
            Guest
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("admin");
              setError(null);
              setPassword("");
            }}
            className={`flex-1 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
              mode === "admin"
                ? "bg-sky-400 text-slate-950"
                : "text-slate-200 hover:text-white"
            }`}
          >
            Admin
          </button>
        </div>
        <div className="mt-6 space-y-2 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-200">
            {mode === "guest" ? "Guest access" : "Admin control room"}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            The Loft at Jindabyne
          </h1>
          <p className="text-sm text-slate-200">
            {mode === "guest"
              ? "Enter the guest password provided in your booking confirmation to explore availability, pricing, and more."
              : "Admins can unlock editing tools to manage property content, bookings, and passwords."}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="access-password"
              className="block text-xs font-semibold uppercase tracking-wide text-slate-200"
            >
              {mode === "guest" ? "Guest password" : "Admin password"}
            </label>
            <input
              id="access-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={
                mode === "guest" ? "Guest access password" : "Admin password"
              }
              className="mt-2 w-full rounded-full border border-white/10 bg-white/10 px-5 py-3 text-base text-white outline-none transition focus:border-white focus:bg-white/20"
            />
          </div>
          {error && (
            <p className="rounded-xl bg-red-500/20 px-4 py-2 text-sm text-red-200">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center rounded-full bg-sky-400 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending
              ? "Authenticating..."
              : mode === "guest"
              ? "Unlock Property Details"
              : "Enter Admin Mode"}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-400">
          Need assistance? Email{" "}
          <a
            className="font-medium text-sky-300"
            href="mailto:jack.francis.aus@gmail.com"
          >
            jack.francis.aus@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}

