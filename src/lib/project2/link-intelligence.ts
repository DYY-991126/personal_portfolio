export function getLinkType(url: string): "google_maps" | "website" | "unknown" {
  try {
    const parsed = new URL(url);
    if (
      parsed.hostname.includes("google.") &&
      (parsed.pathname.includes("/maps") || parsed.pathname.includes("/place"))
    ) {
      return "google_maps";
    }
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return "website";
    }
    return "unknown";
  } catch {
    return "unknown";
  }
}

export function extractGoogleMapsHints(url: string) {
  const placeMatch = url.match(/\/place\/([^/@]+)/);
  const businessName = placeMatch
    ? decodeURIComponent(placeMatch[1].replace(/\+/g, " "))
    : undefined;
  const coordsMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  const locationHint = coordsMatch ? `${coordsMatch[1]}, ${coordsMatch[2]}` : undefined;
  return { businessName, locationHint };
}

export function parseGoogleMapsUrl(url: string) {
  const result: {
    name?: string;
    coords?: {
      lat: number;
      lng: number;
    };
  } = {};

  const placeMatch = url.match(/\/place\/([^/@]+)/);
  if (placeMatch) {
    result.name = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
  }

  const coordMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (coordMatch) {
    result.coords = {
      lat: Number.parseFloat(coordMatch[1]),
      lng: Number.parseFloat(coordMatch[2]),
    };
  }

  return result;
}

type RawSerpPlace = Record<string, unknown>;

export type LocalBusinessProfile = {
  name?: string;
  address?: string;
  phone?: string;
  rating?: number;
  totalReviews?: number;
  website?: string;
  type?: string;
  description?: string;
  priceLevel?: string;
  openState?: string;
  hours?: Record<string, string>;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  highlights?: string[];
  offerings?: string[];
  atmosphere?: string[];
  accessibility?: string[];
  amenities?: string[];
  payments?: string[];
  photos?: string[];
};

function flattenExtensionList(list: unknown) {
  const output: Record<string, unknown> = {};
  if (!Array.isArray(list)) return output;
  for (const entry of list) {
    if (entry && typeof entry === "object") {
      Object.assign(output, entry);
    }
  }
  return output;
}

export function serializePlaceData(raw: RawSerpPlace): LocalBusinessProfile {
  let hours: Record<string, string> | undefined;
  if (Array.isArray(raw.hours)) {
    hours = {};
    for (const entry of raw.hours as Array<Record<string, string>>) {
      Object.assign(hours, entry);
    }
  } else if (raw.operating_hours && typeof raw.operating_hours === "object") {
    hours = raw.operating_hours as Record<string, string>;
  }

  const extensions = flattenExtensionList(raw.extensions);
  const photos = (Array.isArray(raw.images) ? raw.images : [])
    .filter((img) => !(img && typeof img === "object" && "title" in img && img.title === "Street View & 360°"))
    .slice(0, 8)
    .map((img) => {
      if (typeof img === "string") return img;
      if (img && typeof img === "object") {
        const candidate = (img as Record<string, unknown>).thumbnail || (img as Record<string, unknown>).original;
        return typeof candidate === "string" ? candidate : undefined;
      }
      return undefined;
    })
    .filter((value): value is string => Boolean(value));

  return {
    name: typeof raw.title === "string" ? raw.title : undefined,
    address: typeof raw.address === "string" ? raw.address : undefined,
    phone: typeof raw.phone === "string" ? raw.phone : undefined,
    rating: typeof raw.rating === "number" ? raw.rating : undefined,
    totalReviews: typeof raw.reviews === "number" ? raw.reviews : undefined,
    website: typeof raw.website === "string" ? raw.website : undefined,
    type: Array.isArray(raw.type)
      ? raw.type.filter((item): item is string => typeof item === "string").join(", ")
      : typeof raw.type === "string"
        ? raw.type
        : undefined,
    description: typeof raw.description === "string" ? raw.description : undefined,
    priceLevel: typeof raw.price === "string" ? raw.price : undefined,
    openState: typeof raw.open_state === "string" ? raw.open_state : undefined,
    hours,
    coordinates:
      raw.gps_coordinates && typeof raw.gps_coordinates === "object"
        ? (raw.gps_coordinates as { latitude?: number; longitude?: number })
        : undefined,
    highlights: Array.isArray(extensions.highlights)
      ? extensions.highlights.filter((item): item is string => typeof item === "string")
      : [],
    offerings: Array.isArray(extensions.offerings)
      ? extensions.offerings.filter((item): item is string => typeof item === "string")
      : [],
    atmosphere: Array.isArray(extensions.atmosphere)
      ? extensions.atmosphere.filter((item): item is string => typeof item === "string")
      : [],
    accessibility: Array.isArray(extensions.accessibility)
      ? extensions.accessibility.filter((item): item is string => typeof item === "string")
      : [],
    amenities: Array.isArray(extensions.amenities)
      ? extensions.amenities.filter((item): item is string => typeof item === "string")
      : [],
    payments: Array.isArray(extensions.payments)
      ? extensions.payments.filter((item): item is string => typeof item === "string")
      : [],
    photos,
  };
}

export async function fetchSerpApiPlaceFromMapsUrl(url: string) {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) return undefined;

  const parsed = parseGoogleMapsUrl(url);
  if (!parsed.name) return undefined;

  const params = new URLSearchParams({
    engine: "google_maps",
    q: parsed.name,
    api_key: apiKey,
  });

  if (parsed.coords) {
    params.set("ll", `@${parsed.coords.lat},${parsed.coords.lng},15z`);
  }

  try {
    const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
    const data = (await response.json()) as {
      error?: string;
      place_results?: RawSerpPlace;
      local_results?: RawSerpPlace[];
    };

    if (!response.ok) {
      throw new Error(data.error || `SerpAPI returned ${response.status}`);
    }

    const rawPlace = data.place_results || data.local_results?.[0];
    if (!rawPlace) return undefined;
    return serializePlaceData(rawPlace);
  } catch {
    return undefined;
  }
}

export async function fetchFirecrawlMarkdown(url: string) {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) return undefined;

  try {
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `Firecrawl returned ${response.status}`);
    }

    return (data.data?.markdown as string | undefined)?.trim();
  } catch {
    return undefined;
  }
}

export async function fetchWebsiteMetadata(url: string) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
      redirect: "follow",
    });
    const html = await res.text();
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = html.match(
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i
    );

    return {
      title: titleMatch?.[1]?.trim(),
      description: descMatch?.[1]?.trim(),
      html,
    };
  } catch {
    return {};
  }
}

export function buildMarkdownExcerpt(markdown?: string, maxLength = 480) {
  if (!markdown) return undefined;
  const normalized = markdown.replace(/\s+/g, " ").trim();
  if (!normalized) return undefined;
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength)}...` : normalized;
}

export function extractPageSignals(html?: string) {
  if (!html) {
    return {
      discoveredPages: [] as string[],
      headings: [] as string[],
    };
  }

  const links = Array.from(html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi))
    .map((match) => {
      const rawHref = match[1]?.trim();
      const rawLabel = match[2]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) {
        return null;
      }
      return rawLabel || rawHref;
    })
    .filter((value): value is string => Boolean(value));

  const headings = Array.from(html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi))
    .map((match) => match[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
    .filter((value): value is string => Boolean(value));

  return {
    discoveredPages: Array.from(new Set(links)).slice(0, 6),
    headings: Array.from(new Set(headings)).slice(0, 6),
  };
}
