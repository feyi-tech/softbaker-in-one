
export const getStatusColor = (status: "success" | "info" | "warning" | "error" | "loading" | null | undefined): string => {
    switch(status) {
        case "error":
            return "#e53e3e"
        case "info":
        case "loading":
            return "#3182ce"
        case "warning":
            return "#dd6b20"
        case "success":
            return "#38a169"
        default:
            return "#3182ce"
    }
}