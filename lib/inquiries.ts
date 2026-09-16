import { INQUIRY_STATUSES } from "./constants";
import { getServiceSupabase } from "./supabase/admin";
import type { Inquiry, InquiryStatus, InquiryUpdatePayload } from "./types";

interface InquiryRow {
  id: string;
  submitted_at: string;
  name: string;
  company: string | null;
  phone: string;
  email: string | null;
  message: string;
  privacy_agreed: boolean;
  status: string;
  notes: string | null;
}

function formatSubmittedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .format(date)
    .replace("T", " ");
}

function toInquiryStatus(value: string): InquiryStatus {
  return INQUIRY_STATUSES.includes(value as InquiryStatus)
    ? (value as InquiryStatus)
    : "접수";
}

function mapInquiry(row: InquiryRow): Inquiry {
  return {
    id: row.id,
    submittedAt: formatSubmittedAt(row.submitted_at),
    name: row.name,
    company: row.company ?? "",
    phone: row.phone,
    email: row.email ?? "",
    message: row.message,
    privacyAgreed: row.privacy_agreed ? "Y" : "N",
    status: toInquiryStatus(row.status),
    notes: row.notes ?? "",
  };
}

export async function fetchInquiries(): Promise<Inquiry[]> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("inquiries")
    .select(
      "id, submitted_at, name, company, phone, email, message, privacy_agreed, status, notes",
    )
    .order("submitted_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapInquiry(row as InquiryRow));
}

export async function updateInquiry(id: string, payload: InquiryUpdatePayload) {
  const updates: { status?: InquiryStatus; notes?: string } = {};

  if (payload.status !== undefined) updates.status = payload.status;
  if (payload.notes !== undefined) updates.notes = payload.notes;

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("inquiries")
    .update(updates)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Row not found");
  }

  return { success: true };
}
