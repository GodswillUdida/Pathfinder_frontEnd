"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ResetForm({ token }: { token: string }) {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (password !== confirm) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setDone(true);

      setTimeout(() => {
        router.replace("/login"); // 🔥 ALWAYS login after reset
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  export function CenteredState({ title, text, actionLabel, onAction }: any) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          {text && <p>{text}</p>}
          {actionLabel && <button onClick={onAction}>{actionLabel}</button>}
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <CenteredState
        title="Password updated ✅"
        text="Redirecting to login..."
      />
    );
  }

  return (
    <div className="form">
      <h1>Reset Password</h1>

      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirm password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Updating..." : "Reset Password"}
      </button>

      {error && <p>{error}</p>}
    </div>
  );
}
