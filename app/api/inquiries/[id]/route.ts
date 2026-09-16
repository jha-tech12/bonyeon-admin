import { NextResponse } from "next/server";
import { updateInquiry } from "@/lib/inquiries";
import { INQUIRY_STATUSES } from "@/lib/constants";
import { getAuthClaims } from "@/lib/supabase/server";
import type { InquiryStatus } from "@/lib/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getAuthClaims();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
  }

  let body: { status?: InquiryStatus; notes?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "잘못된 요청입니다." }, { status: 400 });
  }

  if (body.status !== undefined && !INQUIRY_STATUSES.includes(body.status)) {
    return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
  }

  if (body.status === undefined && body.notes === undefined) {
    return NextResponse.json({ success: false, error: "변경할 항목이 없습니다." }, { status: 400 });
  }

  try {
    await updateInquiry(id, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "저장에 실패했습니다.";
    const status = message === "Row not found" ? 404 : 502;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
