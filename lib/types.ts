export type InquiryStatus = "접수" | "확인" | "완료";

export interface Inquiry {
  rowId: number;
  submittedAt: string;
  name: string;
  age: string;
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
