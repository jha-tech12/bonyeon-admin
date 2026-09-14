"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { INQUIRY_STATUSES } from "@/lib/constants";
import type { Inquiry, InquiryStatus } from "@/lib/types";

interface InquiryRowProps {
  inquiry: Inquiry;
  onUpdated: (rowId: number, updates: Partial<Inquiry>) => void;
}

export default function InquiryRow({ inquiry, onUpdated }: InquiryRowProps) {
  const [status, setStatus] = useState<InquiryStatus>(inquiry.status);
  const [notes, setNotes] = useState(inquiry.notes);
  const [savingField, setSavingField] = useState<"status" | "notes" | null>(null);
  const [error, setError] = useState("");

  const saveUpdate = async (payload: { status?: InquiryStatus; notes?: string }, field: "status" | "notes") => {
    setSavingField(field);
    setError("");

    try {
      const response = await fetch(`/api/inquiries/${inquiry.rowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !result.success) {
        setError(result.error ?? "저장에 실패했습니다.");
        return;
      }

      onUpdated(inquiry.rowId, payload);
    } catch {
      setError("서버 연결에 실패했습니다.");
    } finally {
      setSavingField(null);
    }
  };

  const handleStatusChange = async (nextStatus: InquiryStatus) => {
    setStatus(nextStatus);
    await saveUpdate({ status: nextStatus }, "status");
  };

  const handleNotesSave = async () => {
    if (notes === inquiry.notes) return;
    await saveUpdate({ notes }, "notes");
  };

  return (
    <tr className="border-b border-deep-green/10 align-top hover:bg-ivory/40">
      <td className="whitespace-nowrap px-4 py-4 text-sm text-deep-green/70">
        {inquiry.submittedAt}
      </td>
      <td className="px-4 py-4 text-sm font-medium text-deep-green">{inquiry.name}</td>
      <td className="px-4 py-4 text-sm text-deep-green/70">{inquiry.age || "-"}</td>
      <td className="px-4 py-4 text-sm text-deep-green">{inquiry.phone}</td>
      <td className="px-4 py-4 text-sm text-deep-green/70">{inquiry.email || "-"}</td>
      <td className="max-w-xs px-4 py-4 text-sm text-deep-green/80">
        <p className="line-clamp-3 whitespace-pre-wrap">{inquiry.message}</p>
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-col gap-2">
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as InquiryStatus)}
            disabled={savingField === "status"}
            className="rounded-md border border-deep-green/15 bg-white px-2 py-1.5 text-sm text-deep-green focus:border-amber focus:outline-none focus:ring-1 focus:ring-amber"
          >
            {INQUIRY_STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <StatusBadge status={status} />
          {savingField === "status" && (
            <span className="inline-flex items-center gap-1 text-xs text-deep-green/50">
              <Loader2 className="h-3 w-3 animate-spin" /> 저장 중
            </span>
          )}
        </div>
      </td>
      <td className="min-w-[220px] px-4 py-4">
        <div className="flex flex-col gap-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="메모 입력"
            className="w-full resize-y rounded-md border border-deep-green/15 bg-white px-3 py-2 text-sm text-deep-green placeholder:text-deep-green/30 focus:border-amber focus:outline-none focus:ring-1 focus:ring-amber"
          />
          <button
            type="button"
            onClick={handleNotesSave}
            disabled={savingField === "notes" || notes === inquiry.notes}
            className="inline-flex items-center justify-center gap-1 rounded-md bg-deep-green px-3 py-1.5 text-xs font-medium text-ivory transition hover:bg-deep-green/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {savingField === "notes" ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
            메모 저장
          </button>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </td>
    </tr>
  );
}
