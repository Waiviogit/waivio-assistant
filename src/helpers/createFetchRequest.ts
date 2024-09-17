interface CreateFetchRequestInterface {
    api: {
        method: string
        url: string
    }
    params: Record<string, any>
}

export const createFetchRequest = async (
    data: CreateFetchRequestInterface
): Promise<any | null> => {
    const {params, api} = data;
    if (!api) throw new Error("No best API found");
    console.log("params",params);
    let response: any = null;
    try {
        if (!params) {
            const fetchRes = await fetch(api.url, {
                headers: { 'Content-Type': 'application/json' },
                method: api.method,
            });
            response = fetchRes.ok ? await fetchRes.json() : await fetchRes.text();
        } else {
            let fetchOptions: Record<string, any> = {
                headers: { 'Content-Type': 'application/json' },
                method: api.method,
            };
            let parsedUrl = api.url;

            const paramKeys = Object.entries(params);
            paramKeys.forEach(([key, value]) => {
                if (parsedUrl.includes(`{${key}}`)) {
                    parsedUrl = parsedUrl.replace(`{${key}}`, value);
                    delete params[key];
                }
            });

            const url = new URL(parsedUrl);

            if (["GET", "HEAD"].includes(api.method)) {
                Object.entries(params).forEach(([key, value]) =>
                    url.searchParams.append(key, value)
                );
            } else {
                fetchOptions = {
                    ...fetchOptions,
                    body: JSON.stringify(params),
                };
            }

            console.log("fetchOptions", fetchOptions)

            const fetchRes = await fetch(url, fetchOptions);
            response = fetchRes.ok ? await fetchRes.json() : await fetchRes.text();
        }

        if (response) return response;
    } catch (e) {
        console.error("Error fetching API");
        console.error(e);
    }

    return null;
}
