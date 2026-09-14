import type { InquiryStatus } from "@/lib/types";

const styles: Record<InquiryStatus, string> = {
  접수: "bg-amber/15 text-amber border-amber/30",
  확인: "bg-sky-100 text-sky-800 border-sky-200",
  완료: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

export default function StatusBadge({ status }: { status: InquiryStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}
