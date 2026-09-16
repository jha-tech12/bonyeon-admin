"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { INQUIRY_STATUSES } from "@/lib/constants";
import type { Inquiry, InquiryStatus } from "@/lib/types";

interface InquiryCardProps {
  inquiry: Inquiry;
  onUpdated: (id: string, updates: Partial<Inquiry>) => void;
}

export default function InquiryCard({ inquiry, onUpdated }: InquiryCardProps) {
  const [status, setStatus] = useState<InquiryStatus>(inquiry.status);
  const [notes, setNotes] = useState(inquiry.notes);
  const [savingField, setSavingField] = useState<"status" | "notes" | null>(null);
  const [error, setError] = useState("");

  const saveUpdate = async (payload: { status?: InquiryStatus; notes?: string }, field: "status" | "notes") => {
    setSavingField(field);
    setError("");

    try {
      const response = await fetch(`/api/inquiries/${inquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !result.success) {
        setError(result.error ?? "저장에 실패했습니다.");
        return;
      }

      onUpdated(inquiry.id, payload);
    } catch {
      setError("서버 연결에 실패했습니다.");
    } finally {
      setSavingField(null);
    }
  };

  return (
    <article className="rounded-xl border border-deep-green/10 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-deep-green">{inquiry.name}</p>
          <p className="mt-1 text-xs text-deep-green/50">{inquiry.submittedAt}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <dl className="mb-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-deep-green/50">연락처</dt>
          <dd className="font-medium text-deep-green">{inquiry.phone}</dd>
        </div>
        <div>
          <dt className="text-deep-green/50">회사</dt>
          <dd className="text-deep-green">{inquiry.company || "-"}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-deep-green/50">이메일</dt>
          <dd className="text-deep-green">{inquiry.email || "-"}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-deep-green/50">문의사항</dt>
          <dd className="mt-1 whitespace-pre-wrap text-deep-green/80">{inquiry.message}</dd>
        </div>
      </dl>

      <div className="space-y-4 border-t border-deep-green/10 pt-4">
        <div>
          <label className="mb-2 block text-xs font-medium text-deep-green/60">처리 상태</label>
          <select
            value={status}
            onChange={(e) => {
              const next = e.target.value as InquiryStatus;
              setStatus(next);
              void saveUpdate({ status: next }, "status");
            }}
            disabled={savingField === "status"}
            className="w-full rounded-md border border-deep-green/15 bg-ivory px-3 py-2 text-sm text-deep-green focus:border-amber focus:outline-none"
          >
            {INQUIRY_STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-deep-green/60">비고</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="메모 입력"
            className="w-full rounded-md border border-deep-green/15 bg-ivory px-3 py-2 text-sm text-deep-green focus:border-amber focus:outline-none"
          />
          <button
            type="button"
            onClick={() => void saveUpdate({ notes }, "notes")}
            disabled={savingField === "notes" || notes === inquiry.notes}
            className="mt-2 inline-flex items-center gap-1 rounded-md bg-deep-green px-3 py-2 text-xs font-medium text-ivory disabled:opacity-40"
          >
            {savingField === "notes" ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
            메모 저장
          </button>
        </div>
      </div>

      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
    </article>
  );
}
