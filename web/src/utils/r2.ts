import { R2_DOMAIN } from "@/root/src/app-config"

export const normalizeMimeType = (mimeType?: string | null, fallback = "application/octet-stream"): string => {
    const normalized = (mimeType || "").trim().toLowerCase()

    if (!normalized) return fallback
    if (normalized.startsWith("img/")) return `image/${normalized.substring("img/".length)}`
    if (normalized === "image/jpg") return "image/jpeg"
    if (normalized === "image/svg") return "image/svg+xml"

    return normalized
}

export const getR2ImageCrossOrigin = (src?: string | null): "anonymous" | undefined => {
    if (!src || src.startsWith("data:") || src.startsWith("/")) return undefined

    try {
        return new URL(src).hostname === R2_DOMAIN ? "anonymous" : undefined
    } catch {
        return undefined
    }
}

export const getCorsSafeR2ImageUrl = (src?: string | null): string | undefined => {
    if (!src) return undefined
    if (src.startsWith("data:") || src.startsWith("/")) return src

    try {
        const parsedUrl = new URL(src)
        if (parsedUrl.hostname === R2_DOMAIN) {
            parsedUrl.searchParams.set("r2_cors", "1")
        }
        return parsedUrl.toString()
    } catch {
        return src
    }
}
