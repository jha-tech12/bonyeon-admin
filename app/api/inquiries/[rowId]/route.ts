import { NextResponse } from "next/server";
import { updateInquiry } from "@/lib/gas-client";
import { INQUIRY_STATUSES } from "@/lib/constants";
import type { InquiryStatus } from "@/lib/types";

interface RouteContext {
  params: Promise<{ rowId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const { rowId: rowIdParam } = await context.params;
  const rowId = Number(rowIdParam);

  if (!Number.isInteger(rowId) || rowId < 2) {
    return NextResponse.json({ success: false, error: "Invalid rowId" }, { status: 400 });
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
    await updateInquiry(rowId, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "저장에 실패했습니다.";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
