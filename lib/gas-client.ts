import type { Inquiry, InquiryListResponse, InquiryUpdatePayload } from "./types";

function getScriptUrl() {
  const url = process.env.GOOGLE_SCRIPT_URL;
  if (!url) {
    throw new Error("GOOGLE_SCRIPT_URL is not configured");
  }
  return url;
}

function getAdminApiKey() {
  const key = process.env.ADMIN_API_KEY;
  if (!key) {
    throw new Error("ADMIN_API_KEY is not configured");
  }
  return key;
}

async function callGas<T>(body: Record<string, unknown>): Promise<T> {
  const response = await fetch(getScriptUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    redirect: "follow",
    cache: "no-store",
  });

  const text = await response.text();

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Google Apps Script 응답을 해석할 수 없습니다.");
  }
}

export async function fetchInquiries(): Promise<Inquiry[]> {
  const data = await callGas<InquiryListResponse>({
    action: "list",
    apiKey: getAdminApiKey(),
  });

  if (!data.success) {
    throw new Error(data.error ?? "문의 목록을 불러오지 못했습니다.");
  }

  return data.inquiries ?? [];
}

export async function updateInquiry(rowId: number, payload: InquiryUpdatePayload) {
  const data = await callGas<{ success: boolean; error?: string }>({
    action: "update",
    apiKey: getAdminApiKey(),
    rowId,
    ...payload,
  });

  if (!data.success) {
    throw new Error(data.error ?? "저장에 실패했습니다.");
  }

  return data;
}
