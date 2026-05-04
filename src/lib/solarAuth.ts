import { useEffect, useState } from "react";
import { getApiUrl, runtimeConfig } from "@/lib/runtimeConfig";

export type SolarUser = {
  id: string;
  email: string;
  fullName: string;
  role: "user" | "admin";
  provider: "email" | "google";
  createdAt: string;
};

export type KycSubmission = {
  id: string;
  userId: string;
  fullName: string;
  dob: string;
  address: string;
  nin: string;
  documents: Array<{
    type: "ID" | "License" | "NIN" | "Passport" | "ProofOfAddress";
    file: UploadedFile;
  }>;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
};

export type UploadedFile = {
  originalName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  uploadedAt: string;
};

export type LoanAttachment = {
  label: string;
  description?: string | null;
  file: UploadedFile;
};

export type LoanApplication = {
  id: string;
  userId: string;
  applicantName: string;
  email: string;
  phone: string;
  capacityKw: number;
  amount: number;
  tenureMonths: number;
  collateral: string;
  bank: string;
  monthlyIncome: number;
  purpose: string;
  attachments?: LoanAttachment[];
  status: "submitted" | "under_review" | "approved" | "rejected";
  submittedAt: string;
};

export type EnergyBooking = {
  id: string;
  userId: string;
  applicantName: string;
  phone: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  capacityKw: number;
  location: string;
  notes?: string;
  status: "pending" | "confirmed" | "cancelled";
  submittedAt: string;
};

export type PortalNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
  data?: unknown;
};

const K = {
  token: "solar.portal.token",
  user: "solar.portal.user",
};

const emit = () => window.dispatchEvent(new Event("solar-auth-change"));

function saveSession(token: string, user: SolarUser) {
  localStorage.setItem(K.token, token);
  localStorage.setItem(K.user, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(K.token);
  localStorage.removeItem(K.user);
}

function readSessionUser(): SolarUser | null {
  try {
    const raw = localStorage.getItem(K.user);
    return raw ? (JSON.parse(raw) as SolarUser) : null;
  } catch {
    return null;
  }
}

function authToken() {
  return localStorage.getItem(K.token);
}

async function apiFetch<T>(path: string, init: RequestInit = {}, requiresAuth = true): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), runtimeConfig.apiTimeoutMs);
  const token = authToken();

  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> | undefined),
  };
  const isFormDataBody = typeof FormData !== "undefined" && init.body instanceof FormData;
  if (!isFormDataBody && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  if (requiresAuth && token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(getApiUrl(`${runtimeConfig.solarPublicApiPrefix}${path}`), {
      ...init,
      headers,
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.message || "Request failed");
    }
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } finally {
    window.clearTimeout(timeout);
  }
}

function withRole(user: Omit<SolarUser, "role">): SolarUser {
  return { ...user, role: "user" };
}

export const solarAuth = {
  current(): SolarUser | null {
    return readSessionUser();
  },

  async restore() {
    const token = authToken();
    if (!token) {
      clearSession();
      emit();
      return null;
    }
    try {
      const data = await apiFetch<{ user: Omit<SolarUser, "role"> }>("/auth/me");
      const user = withRole(data.user);
      saveSession(token, user);
      emit();
      return user;
    } catch {
      clearSession();
      emit();
      return null;
    }
  },

  async signOut() {
    try {
      await apiFetch<void>("/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors on logout; local session must still be cleared.
    }
    clearSession();
    emit();
  },

  async signInEmail(email: string, password: string): Promise<SolarUser> {
    const data = await apiFetch<{ token: string; user: Omit<SolarUser, "role"> }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) },
      false,
    );
    const user = withRole(data.user);
    saveSession(data.token, user);
    emit();
    return user;
  },

  async signUpEmail(email: string, password: string, fullName: string): Promise<SolarUser> {
    const data = await apiFetch<{ token: string; user: Omit<SolarUser, "role"> }>(
      "/auth/signup",
      { method: "POST", body: JSON.stringify({ email, password, fullName }) },
      false,
    );
    const user = withRole(data.user);
    saveSession(data.token, user);
    emit();
    return user;
  },

  async signInGoogle(idToken: string): Promise<SolarUser> {
    const data = await apiFetch<{ token: string; user: Omit<SolarUser, "role"> }>(
      "/auth/google",
      { method: "POST", body: JSON.stringify({ idToken }) },
      false,
    );
    const user = withRole(data.user);
    saveSession(data.token, user);
    emit();
    return user;
  },
};

export const solarStore = {
  async uploadFile(file: File): Promise<UploadedFile> {
    if (file.size > 20 * 1024 * 1024) {
      throw new Error("File exceeds 20MB limit.");
    }
    const formData = new FormData();
    formData.append("file", file);
    const result = await apiFetch<{ file: UploadedFile }>("/uploads", {
      method: "POST",
      body: formData,
    });
    return result.file;
  },

  async listKyc(): Promise<KycSubmission[]> {
    const result = await apiFetch<{ item: any | null }>("/kyc");
    if (!result.item) return [];
    const normalizedDocuments = Array.isArray(result.item.documents)
      ? result.item.documents
        .map((entry: any) => {
          if (!entry || typeof entry !== "object") return null;
          const file = entry.file && typeof entry.file === "object"
            ? entry.file
            : {
              originalName: String(entry.name || "legacy-document"),
              mimeType: String(entry.mimeType || "application/octet-stream"),
              size: Number(entry.size || 0),
              storagePath: String(entry.storagePath || ""),
              uploadedAt: String(entry.uploadedAt || result.item.submittedAt || new Date().toISOString()),
            };
          return {
            type: entry.type,
            file,
          };
        })
        .filter(Boolean)
      : [];
    return [
      {
        id: result.item.id,
        userId: readSessionUser()?.id || "",
        fullName: result.item.fullName,
        dob: result.item.dob,
        address: result.item.address,
        nin: result.item.nin,
        documents: normalizedDocuments as KycSubmission["documents"],
        status: result.item.status,
        submittedAt: result.item.submittedAt,
      },
    ];
  },

  async myKyc(_userId: string) {
    const list = await this.listKyc();
    return list[0] ?? null;
  },

  async submitKyc(s: Omit<KycSubmission, "id" | "submittedAt" | "status">) {
    await apiFetch<{ id: string }>("/kyc", {
      method: "POST",
      body: JSON.stringify({
        fullName: s.fullName,
        dob: s.dob,
        address: s.address,
        nin: s.nin,
        documents: s.documents,
      }),
    });
  },

  async setKycStatus() {
    throw new Error("KYC status updates are managed in ERP.");
  },

  async listLoans(): Promise<LoanApplication[]> {
    const result = await apiFetch<{ items: any[] }>("/loans");
    const userId = readSessionUser()?.id || "";
    return result.items.map((item) => ({
      id: item.id,
      userId,
      applicantName: item.applicantName,
      email: item.email,
      phone: item.phone,
      capacityKw: Number(item.capacityKw || 0),
      amount: Number(item.amount || 0),
      tenureMonths: Number(item.tenureMonths || 0),
      collateral: item.collateral || "",
      bank: item.bank || "",
      monthlyIncome: Number(item.monthlyIncome || 0),
      purpose: item.purpose || "",
      attachments: Array.isArray(item.attachments)
        ? item.attachments
          .map((entry: any) => {
            if (!entry || typeof entry !== "object" || !entry.file) return null;
            return {
              label: String(entry.label || "Attachment"),
              description: entry.description ? String(entry.description) : null,
              file: entry.file,
            } as LoanAttachment;
          })
          .filter(Boolean) as LoanAttachment[]
        : [],
      status: item.status,
      submittedAt: item.submittedAt,
    }));
  },

  async myLoans(_userId: string) {
    return this.listLoans();
  },

  async submitLoan(l: Omit<LoanApplication, "id" | "submittedAt" | "status">) {
    await apiFetch<{ id: string }>("/loans", {
      method: "POST",
      body: JSON.stringify({
        applicantName: l.applicantName,
        email: l.email,
        phone: l.phone,
        capacityKw: l.capacityKw,
        amount: l.amount,
        tenureMonths: l.tenureMonths,
        collateral: l.collateral,
        bank: l.bank,
        monthlyIncome: l.monthlyIncome,
        purpose: l.purpose,
        attachments: l.attachments || [],
      }),
    });
  },

  async setLoanStatus() {
    throw new Error("Loan status updates are managed in ERP.");
  },

  async listBookings(): Promise<EnergyBooking[]> {
    const result = await apiFetch<{ items: any[] }>("/bookings");
    const userId = readSessionUser()?.id || "";
    return result.items.map((item) => ({
      id: item.id,
      userId,
      applicantName: item.applicantName,
      phone: item.phone,
      startDate: item.startDate,
      endDate: item.endDate,
      startTime: item.startTime,
      endTime: item.endTime,
      capacityKw: Number(item.capacityKw || 0),
      location: item.location || "",
      notes: item.notes || "",
      status: item.status,
      submittedAt: item.submittedAt,
    }));
  },

  async myBookings(_userId: string) {
    return this.listBookings();
  },

  async submitBooking(b: Omit<EnergyBooking, "id" | "submittedAt" | "status">) {
    await apiFetch<{ id: string }>("/bookings", {
      method: "POST",
      body: JSON.stringify({
        applicantName: b.applicantName,
        phone: b.phone,
        startDate: b.startDate,
        endDate: b.endDate,
        startTime: b.startTime,
        endTime: b.endTime,
        capacityKw: b.capacityKw,
        location: b.location,
        notes: b.notes || null,
      }),
    });
  },

  async setBookingStatus() {
    throw new Error("Booking status updates are managed in ERP.");
  },

  async listNotifications(): Promise<PortalNotification[]> {
    const result = await apiFetch<{ items: PortalNotification[] }>("/notifications");
    return result.items || [];
  },

  async markNotificationRead(notificationId: string) {
    await apiFetch<void>(`/notifications/${notificationId}/read`, { method: "POST" });
  },
};

export function useSolarUser() {
  const [user, setUser] = useState<SolarUser | null>(() => solarAuth.current());
  useEffect(() => {
    const sync = () => setUser(solarAuth.current());
    window.addEventListener("solar-auth-change", sync);
    window.addEventListener("storage", sync);
    solarAuth.restore().then((restored) => setUser(restored));
    return () => {
      window.removeEventListener("solar-auth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return user;
}
