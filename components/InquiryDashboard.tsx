"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, RefreshCw } from "lucide-react";
import InquiryRow from "./InquiryRow";
import InquiryCard from "./InquiryCard";
import type { Inquiry, InquiryStatus } from "@/lib/types";

type FilterStatus = "전체" | InquiryStatus;

export default function InquiryDashboard() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filter, setFilter] = useState<FilterStatus>("전체");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadInquiries = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    setError("");

    try {
      const response = await fetch("/api/inquiries");
      const result = (await response.json()) as {
        success?: boolean;
        inquiries?: Inquiry[];
        error?: string;
      };

      if (!response.ok || !result.success) {
        setError(result.error ?? "문의 목록을 불러오지 못했습니다.");
        return;
      }

      setInquiries(result.inquiries ?? []);
    } catch {
      setError("서버 연결에 실패했습니다.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadInquiries();
  }, [loadInquiries]);

  const filteredInquiries = useMemo(() => {
    if (filter === "전체") return inquiries;
    return inquiries.filter((item) => item.status === filter);
  }, [filter, inquiries]);

  const counts = useMemo(() => {
    return {
      전체: inquiries.length,
      접수: inquiries.filter((item) => item.status === "접수").length,
      확인: inquiries.filter((item) => item.status === "확인").length,
      완료: inquiries.filter((item) => item.status === "완료").length,
    };
  }, [inquiries]);

  const handleUpdated = (rowId: number, updates: Partial<Inquiry>) => {
    setInquiries((prev) =>
      prev.map((item) => (item.rowId === rowId ? { ...item, ...updates } : item)),
    );
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const filters: FilterStatus[] = ["전체", "접수", "확인", "완료"];

  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-deep-green/10 bg-deep-green text-ivory">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ivory/50">BONYEON Admin</p>
            <h1 className="mt-1 font-serif text-2xl">문의 관리</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void loadInquiries(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-ivory/20 px-3 py-2 text-sm transition hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              새로고침
            </button>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="inline-flex items-center gap-2 rounded-lg bg-amber px-3 py-2 text-sm font-medium text-deep-green transition hover:bg-amber/90"
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                filter === item
                  ? "bg-deep-green text-ivory"
                  : "bg-white text-deep-green/70 hover:bg-deep-green/5"
              }`}
            >
              {item} ({counts[item]})
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="rounded-xl border border-deep-green/10 bg-white p-10 text-center text-deep-green/60">
            문의 내역을 불러오는 중...
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
            <p className="mt-2 text-xs text-red-600/80">
              Apps Script에 ADMIN_API_KEY가 설정되어 있는지, GAS 코드가 최신 버전으로 배포되었는지 확인해 주세요.
            </p>
          </div>
        )}

        {!isLoading && !error && filteredInquiries.length === 0 && (
          <div className="rounded-xl border border-deep-green/10 bg-white p-10 text-center text-deep-green/60">
            {filter === "전체" ? "접수된 문의가 없습니다." : `'${filter}' 상태의 문의가 없습니다.`}
          </div>
        )}

        {!isLoading && !error && filteredInquiries.length > 0 && (
          <>
            <div className="hidden overflow-hidden rounded-xl border border-deep-green/10 bg-white shadow-sm lg:block">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-deep-green/5 text-xs uppercase tracking-wide text-deep-green/60">
                    <tr>
                      <th className="px-4 py-3">접수일시</th>
                      <th className="px-4 py-3">성함</th>
                      <th className="px-4 py-3">나이</th>
                      <th className="px-4 py-3">연락처</th>
                      <th className="px-4 py-3">이메일</th>
                      <th className="px-4 py-3">문의사항</th>
                      <th className="px-4 py-3">처리 상태</th>
                      <th className="px-4 py-3">비고</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInquiries.map((inquiry) => (
                      <InquiryRow
                        key={inquiry.rowId}
                        inquiry={inquiry}
                        onUpdated={handleUpdated}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-4 lg:hidden">
              {filteredInquiries.map((inquiry) => (
                <InquiryCard
                  key={inquiry.rowId}
                  inquiry={inquiry}
                  onUpdated={handleUpdated}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
