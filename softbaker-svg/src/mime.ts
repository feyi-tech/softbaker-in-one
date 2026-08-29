export const normalizeMimeType = (mimeType?: string | null, fallback = "application/octet-stream"): string => {
  const normalized = (mimeType || "").trim().toLowerCase();

  if (!normalized) return fallback;
  if (normalized.startsWith("img/")) return `image/${normalized.substring("img/".length)}`;
  if (normalized === "image/jpg") return "image/jpeg";
  if (normalized === "image/svg") return "image/svg+xml";

  return normalized;
};
