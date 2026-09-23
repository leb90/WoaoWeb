import { fetchApi, proxyJsonResponse } from "../../auth/shared";

export async function GET() {
    const response = await fetchApi("/donations/packages", {
        cache: "no-store",
    });

    return proxyJsonResponse(response);
}
