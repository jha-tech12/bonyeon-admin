import { NextResponse } from "next/server";
import { createSessionToken, getSessionCookieOptions } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/constants";

export async function POST(request: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json(
      { success: false, error: "관리자 비밀번호가 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  let password = "";

  try {
    const body = (await request.json()) as { password?: string };
    password = body.password ?? "";
  } catch {
    return NextResponse.json(
      { success: false, error: "잘못된 요청입니다." },
      { status: 400 },
    );
  }

  if (password !== adminPassword) {
    return NextResponse.json(
      { success: false, error: "비밀번호가 올바르지 않습니다." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, createSessionToken(), getSessionCookieOptions());
  return response;
}
