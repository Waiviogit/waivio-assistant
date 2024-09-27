interface CreateFetchRequestInterface {
  api: {
    method: string;
    url: string;
  };
  params: Record<string, any>;
  accessHost?: string;
}

export const createFetchRequest = async (
  data: CreateFetchRequestInterface,
): Promise<any | null> => {
  const { params, api, accessHost } = data;
  if (!api) throw new Error('No best API found');

  let response: any = null;
  try {
    let fetchOptions: Record<string, any> = {
      headers: {
        'Content-Type': 'application/json',
        ...(accessHost && { 'Access-Host': accessHost }),
      },
      method: api.method,
    };

    if (!params) {
      const fetchRes = await fetch(api.url, fetchOptions);
      response = fetchRes.ok ? await fetchRes.json() : await fetchRes.text();
    } else {
      let parsedUrl = api.url;

      const paramKeys = Object.entries(params);
      paramKeys.forEach(([key, value]) => {
        if (parsedUrl.includes(`{${key}}`)) {
          parsedUrl = parsedUrl.replace(`{${key}}`, value);
          delete params[key];
        }
      });

      const url = new URL(parsedUrl);

      if (['GET', 'HEAD'].includes(api.method)) {
        Object.entries(params).forEach(([key, value]) =>
          url.searchParams.append(key, value),
        );
      } else {
        fetchOptions = {
          ...fetchOptions,
          body: JSON.stringify(params),
        };
      }

      const fetchRes = await fetch(url, fetchOptions);
      response = fetchRes.ok ? await fetchRes.json() : await fetchRes.text();
    }

    if (response) return response;
  } catch (e) {
    console.error('Error fetching API');
    console.error(e);
  }

  return null;
};
