import { BRAVE_API_KEY } from "../config";

// API response types
export interface BraveWeb {
  web?: {
    results?: Array<{
      title: string;
      description: string;
      url: string;
      language?: string;
      published?: string;
      rank?: number;
    }>;
  };
  locations?: {
    results?: Array<{
      id: string;
      title?: string;
    }>;
  };
}

export interface BraveLocation {
  id: string;
  name: string;
  address: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  phone?: string;
  rating?: {
    ratingValue?: number;
    ratingCount?: number;
  };
  openingHours?: string[];
  priceRange?: string;
}

export interface BravePoiResponse {
  results: BraveLocation[];
}

export interface BraveDescription {
  descriptions: { [id: string]: string };
}

// Web search API call
export async function performWebSearch(
  query: string,
  count: number = 10,
  offset: number = 0
) {
  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.searchParams.set("q", query);
  url.searchParams.set("count", Math.min(count, 20).toString()); // API limit
  url.searchParams.set("offset", offset.toString());

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": BRAVE_API_KEY!,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Brave API error: ${response.status} ${
        response.statusText
      }\n${await response.text()}`
    );
  }

  const data = (await response.json()) as BraveWeb;

  // Extract just web results
  const results = (data.web?.results || []).map((result) => ({
    title: result.title || "",
    description: result.description || "",
    url: result.url || "",
  }));

  return results
    .map(
      (r) => `Title: ${r.title}\nDescription: ${r.description}\nURL: ${r.url}`
    )
    .join("\n\n");
}

// Get POI details
export async function getPoisData(ids: string[]): Promise<BravePoiResponse> {
  const url = new URL("https://api.search.brave.com/res/v1/local/pois");
  ids.filter(Boolean).forEach((id) => url.searchParams.append("ids", id));
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": BRAVE_API_KEY!,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Brave API error: ${response.status} ${
        response.statusText
      }\n${await response.text()}`
    );
  }

  return (await response.json()) as BravePoiResponse;
}

// Get descriptions data
export async function getDescriptionsData(
  ids: string[]
): Promise<BraveDescription> {
  const url = new URL("https://api.search.brave.com/res/v1/local/descriptions");
  ids.filter(Boolean).forEach((id) => url.searchParams.append("ids", id));
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": BRAVE_API_KEY!,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Brave API error: ${response.status} ${
        response.statusText
      }\n${await response.text()}`
    );
  }

  return (await response.json()) as BraveDescription;
}

// Local search API call with poi details
export async function performLocalSearch(query: string, count: number = 5) {
  // Initial search to get location IDs
  const webUrl = new URL("https://api.search.brave.com/res/v1/web/search");
  webUrl.searchParams.set("q", query);
  webUrl.searchParams.set("search_lang", "en");
  webUrl.searchParams.set("result_filter", "locations");
  webUrl.searchParams.set("count", Math.min(count, 20).toString());

  const webResponse = await fetch(webUrl, {
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": BRAVE_API_KEY!,
    },
  });

  if (!webResponse.ok) {
    throw new Error(
      `Brave API error: ${webResponse.status} ${
        webResponse.statusText
      }\n${await webResponse.text()}`
    );
  }

  const webData = (await webResponse.json()) as BraveWeb;
  const locationIds =
    webData.locations?.results
      ?.filter((r): r is { id: string; title?: string } => r.id != null)
      .map((r) => r.id) || [];

  if (locationIds.length === 0) {
    return performWebSearch(query, count); // Fallback to web search
  }

  // Get POI details and descriptions in parallel
  const [poisData, descriptionsData] = await Promise.all([
    getPoisData(locationIds),
    getDescriptionsData(locationIds),
  ]);

  return formatLocalResults(poisData, descriptionsData);
}

// Format local search results
export function formatLocalResults(
  poisData: BravePoiResponse,
  descData: BraveDescription
): string {
  return (
    (poisData.results || [])
      .map((poi) => {
        const address =
          [
            poi.address?.streetAddress ?? "",
            poi.address?.addressLocality ?? "",
            poi.address?.addressRegion ?? "",
            poi.address?.postalCode ?? "",
          ]
            .filter((part) => part !== "")
            .join(", ") || "N/A";

        return `Name: ${poi.name}
Address: ${address}
Phone: ${poi.phone || "N/A"}
Rating: ${poi.rating?.ratingValue ?? "N/A"} (${
          poi.rating?.ratingCount ?? 0
        } reviews)
Price Range: ${poi.priceRange || "N/A"}
Hours: ${(poi.openingHours || []).join(", ") || "N/A"}
Description: ${descData.descriptions[poi.id] || "No description available"}
`;
      })
      .join("\n---\n") || "No local results found"
  );
}
