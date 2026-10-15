import API from "./api";

export interface Artisan {
  _id: string;
  name: string;
  location: string;
  destination: string;
  craft: string;
  product: string;
  description?: string;
  price?: string;
  image?: string;
  contact?: string;
  source?: string;
  sourceUrl?: string;
  verifiedArtisan?: boolean;
}

export interface ArtisanResponse {
  success: boolean;
  count: number;
  data: Artisan[];
  destination?: string;
  overview?: string;
  source?: string;
  message?: string;
  attribution?: string;
}

export async function saveArtisan(
  artisan: Partial<Artisan>
): Promise<{ success: boolean; data: Artisan; message?: string }> {
  const response = await API.post("/artisans", artisan);
  return response.data;
}

export async function getArtisans(
  search = ""
): Promise<Artisan[]> {
  const response = await API.get("/artisans", {
    params: search.trim() ? { search: search.trim() } : {},
  });

  return response.data.data ?? [];
}

export async function discoverArtisans(
  destination: string
): Promise<ArtisanResponse> {
  const response = await API.get("/artisans/discover", {
    params: { destination: destination.trim() },
    timeout: 40000,
  });

  return response.data as ArtisanResponse;
}