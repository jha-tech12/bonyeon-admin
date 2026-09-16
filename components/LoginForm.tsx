"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function toLoginError(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes("invalid login")) {
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  }

  if (lower.includes("email not confirmed")) {
    return "이메일 인증이 완료되지 않았습니다. Supabase에서 사용자를 확인한 뒤 다시 시도해 주세요.";
  }

  return message || "로그인에 실패했습니다.";
}

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(toLoginError(signInError.message));
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("서버 연결에 실패했습니다. Supabase 환경 변수를 확인해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-ivory/80">
          이메일
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/40" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-ivory/15 bg-white/5 py-3 pl-10 pr-4 text-ivory placeholder:text-ivory/30 focus:border-amber focus:outline-none focus:ring-1 focus:ring-amber"
            placeholder="admin@example.com"
            autoComplete="email"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-ivory/80">
          비밀번호
        </label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/40" />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-ivory/15 bg-white/5 py-3 pl-10 pr-4 text-ivory placeholder:text-ivory/30 focus:border-amber focus:outline-none focus:ring-1 focus:ring-amber"
            placeholder="비밀번호 입력"
            autoComplete="current-password"
            required
          />
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-amber px-4 py-3 text-sm font-semibold text-deep-green transition hover:bg-amber/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "로그인 중..." : "로그인"}
      </button>
    </form>
  );
}
