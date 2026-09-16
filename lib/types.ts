export type InquiryStatus = "접수" | "확인" | "완료";

export interface Inquiry {
  id: string;
  submittedAt: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  message: string;
  privacyAgreed: string;
  status: InquiryStatus;
  notes: string;
}

export interface InquiryListResponse {
  success: boolean;
  inquiries?: Inquiry[];
  error?: string;
}

export interface InquiryUpdatePayload {
  status?: InquiryStatus;
  notes?: string;
}
