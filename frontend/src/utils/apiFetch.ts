// utils/apiFetch.ts
interface FetchOptions extends RequestInit {
    bodyData?: any;
}

export async function apiFetch(endpoint: string, options: FetchOptions = {}) {
    const { bodyData, ...customConfig } = options;

    const config: RequestInit = {
        credentials: "include",
        ...customConfig,
        headers: {
            ...customConfig.headers,
        },
    };

    if (bodyData) {
        config.headers = {
            "Content-Type": "application/json",
            ...config.headers,
        };
        config.body = JSON.stringify(bodyData);
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, config);

    let errorData: any = null;
    if (response.headers.get("content-type")?.includes("application/json")) {
        errorData = await response.json().catch(() => null);
    }

    if (!response.ok) {
        // Intercept session errors
        if (response.status === 401 || response.status === 403) {
            // Check if backend attached a specific account lifecycle status message
            const backendReason = errorData?.reason?.toLowerCase() || errorData?.message?.toLowerCase();

            let queryReason = "expired";
            if (backendReason?.includes("pending")) queryReason = "pending";
            else if (backendReason?.includes("rejected")) queryReason = "rejected";
            else if (backendReason?.includes("inactive") || backendReason?.includes("deactivated")) queryReason = "inactive";

            const error = new Error("session_ended");
            (error as any).status = response.status;
            (error as any).reason = queryReason;
            throw error;
        }

        const backendMessage = errorData?.message;

        const formattedMessage = Array.isArray(backendMessage)
            ? backendMessage.join("\n")
            : backendMessage;

        const error = new Error(formattedMessage || `Request failed with status ${response.status}`);
        (error as any).status = response.status;
        throw error;
    }

    return errorData || response;
}
