const toBool = (value: string | undefined, fallback = false) => {
  if (typeof value !== "string") return fallback;
  return value.toLowerCase() === "true";
};

const toInt = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const runtimeConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000",
  publicAppOrigin: import.meta.env.VITE_PUBLIC_APP_ORIGIN || "http://localhost:5173",
  solarPublicApiPrefix: import.meta.env.VITE_SOLAR_PUBLIC_API_PREFIX || "/api/public/solar",
  useSolarMock: toBool(import.meta.env.VITE_USE_SOLAR_MOCK, true),
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
  recaptchaSiteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY || "",
  apiTimeoutMs: toInt(import.meta.env.VITE_API_TIMEOUT_MS, 15000),
};

export const getApiUrl = (path: string) => {
  const base = runtimeConfig.apiBaseUrl.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
};
