import { createQueryParams } from "./utils";

export const getPexelsImage = async (query: string) => {
    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) {
        throw new Error("PEXELS_API_KEY is not set");
    }
    const queryParams = createQueryParams({
        query,
        per_page: 1,
        orientation: "landscape",
    });
    const response = await fetch(`https://api.pexels.com/v1/search?${queryParams}`, {
        headers: {
            Authorization: apiKey,
        },
    });
    const data = await response.json();
    return data.photos[0].src.large;
}