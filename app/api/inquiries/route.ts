import { NextResponse } from "next/server";
import { fetchInquiries } from "@/lib/inquiries";
import { getAuthClaims } from "@/lib/supabase/server";

export async function GET() {
  const user = await getAuthClaims();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const inquiries = await fetchInquiries();
    return NextResponse.json({ success: true, inquiries });
  } catch (error) {
    const message = error instanceof Error ? error.message : "문의 목록 조회에 실패했습니다.";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
