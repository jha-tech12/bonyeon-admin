import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-deep-green px-4">
      <div className="w-full max-w-md rounded-2xl border border-ivory/10 bg-white/5 p-8 backdrop-blur-sm">
        <div className="mb-8 text-center">
          <p className="font-serif text-3xl text-ivory">BONYEON</p>
          <p className="mt-2 text-sm text-ivory/60">문의 관리자 페이지</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
