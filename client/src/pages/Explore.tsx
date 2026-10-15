
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Heart,
  Globe2,
  ExternalLink,
  LoaderCircle,
  RotateCcw,
  BookmarkCheck,
} from "lucide-react";

type Destination = {
  id: number;
  name: string;
  country: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  admin1?: string;
};

type WishlistPlace = {
  id: string;
  destination: string;
  country: string;
  rating: number | null;
  image: string;
  budget: string;
};

const WISHLIST_KEY = "travel-genie-wishlist";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200";

const FEATURED = [
  "Bali",
  "Paris",
  "Tokyo",
  "Dubai",
  "Santorini",
  "Zurich",
];

async function findPlaces(query: string): Promise<Destination[]> {
  const params = new URLSearchParams({
    name: query,
    count: "10",
    language: "en",
    format: "json",
  });

  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Destination search is temporarily unavailable.");
  }

  const data = await response.json();

  return (data.results ?? []).map(
    (place: {
      id: number;
      name: string;
      country?: string;
      country_code?: string;
      latitude: number;
      longitude: number;
      admin1?: string;
    }) => ({
      id: place.id,
      name: place.name,
      country: place.country ?? "Country unavailable",
      countryCode: place.country_code,
      latitude: place.latitude,
      longitude: place.longitude,
      admin1: place.admin1,
    })
  );
}

function loadWishlist(): WishlistPlace[] {
  try {
    const stored = localStorage.getItem(WISHLIST_KEY);

    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is WishlistPlace =>
        item !== null &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.destination === "string" &&
        typeof item.country === "string" &&
        typeof item.image === "string" &&
        typeof item.budget === "string"
    );
  } catch {
    return [];
  }
}

function placeKey(name: string, country: string) {
  return `${name.trim().toLowerCase()}|${country.trim().toLowerCase()}`;
}

export default function Explore() {
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState<Destination[]>([]);
  const [wishlist, setWishlist] = useState<WishlistPlace[]>([]);
  const [wishlistLoaded, setWishlistLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [notice, setNotice] = useState("");

  // Load the same wishlist used by Wishlist.tsx.
  useEffect(() => {
    setWishlist(loadWishlist());
    setWishlistLoaded(true);
  }, []);

  // Save changes using the same storage key as Wishlist.tsx.
  useEffect(() => {
    if (!wishlistLoaded) return;

    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch {
      setNotice("Browser storage is unavailable. Your change may not persist.");
    }
  }, [wishlist, wishlistLoaded]);

  // Keep this page in sync if Wishlist is changed in another browser tab.
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === WISHLIST_KEY) {
        setWishlist(loadWishlist());
      }
    }

    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const savedKeys = useMemo(
    () =>
      new Set(
        wishlist.map((place) =>
          placeKey(place.destination, place.country)
        )
      ),
    [wishlist]
  );

  async function searchPlaces(
    term: string,
    event?: FormEvent<HTMLFormElement>
  ) {
    event?.preventDefault();

    const cleaned = term.trim();

    if (!cleaned) {
      setError("Enter a city or destination name to search.");
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");
    setHasSearched(true);

    try {
      const results = await findPlaces(cleaned);
      setPlaces(results);

      if (results.length === 0) {
        setError("No matching places found. Try another destination.");
      }
    } catch {
      setPlaces([]);
      setError(
        "Unable to load destinations. Check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function toggleFavorite(place: Destination) {
    const key = placeKey(place.name, place.country);
    const alreadySaved = savedKeys.has(key);

    setWishlist((current) => {
      if (alreadySaved) {
        return current.filter(
          (item) =>
            placeKey(item.destination, item.country) !== key
        );
      }

      const newPlace: WishlistPlace = {
        id: `explore-${place.id}-${Date.now()}`,
        destination: place.name,
        country: place.country,
        rating: null,
        image: FALLBACK_IMAGE,
        budget: "Not estimated",
      };

      return [newPlace, ...current];
    });

    setNotice(
      alreadySaved
        ? `${place.name} removed from your wishlist.`
        : `${place.name} saved to your wishlist.`
    );
  }

  function openMap(place: Destination) {
    const url = new URL("https://www.openstreetmap.org/");
    url.searchParams.set("mlat", String(place.latitude));
    url.searchParams.set("mlon", String(place.longitude));
    url.hash = `map=12/${place.latitude}/${place.longitude}`;

    window.open(url.toString(), "_blank", "noopener,noreferrer");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#E78FB3]">
            Find your next adventure
          </p>

          <h1 className="mt-4 text-4xl font-black text-gray-900 sm:text-5xl">
            Explore <span className="text-[#E78FB3]">Destinations</span>
          </h1>

          <p className="mt-5 max-w-2xl text-lg text-gray-600">
            Search real places around the world, save your favourites, and
            discover where your next journey could take you.
          </p>
        </motion.div>
      </section>

      {/* Search */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <form
          onSubmit={(event) => searchPlaces(query, event)}
          className="rounded-3xl border border-pink-100 bg-white p-5 shadow-xl sm:p-6"
        >
          <label
            htmlFor="destination-search"
            className="mb-3 block font-semibold text-gray-800"
          >
            Where would you like to go?
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-pink-100 px-4 focus-within:border-[#E78FB3]">
              <Search className="shrink-0 text-[#E78FB3]" size={21} />

              <input
                id="destination-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try Paris, Tokyo, Ahmedabad..."
                className="w-full py-4 text-gray-800 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#E78FB3] px-7 py-4 font-semibold text-white transition hover:bg-pink-500 disabled:opacity-60"
            >
              {loading ? (
                <LoaderCircle size={20} className="animate-spin" />
              ) : (
                <Search size={20} />
              )}
              Search destinations
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm text-gray-500">Try:</span>

            {FEATURED.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setQuery(name);
                  void searchPlaces(name);
                }}
                className="rounded-full bg-pink-50 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-pink-100"
              >
                {name}
              </button>
            ))}
          </div>
        </form>

        {/* Feedback */}
        {notice && (
          <div
            role="status"
            className="mt-5 flex items-center gap-2 rounded-2xl border border-pink-100 bg-white p-4 text-sm font-medium text-pink-700"
          >
            <BookmarkCheck size={18} />
            {notice}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-2xl border border-pink-200 bg-white p-4 text-sm text-gray-700"
          >
            {error}
          </div>
        )}

        {/* Results heading */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {hasSearched ? "Search results" : "Start exploring"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {hasSearched
                ? `${places.length} location${places.length === 1 ? "" : "s"} found`
                : "Search for a city to discover its real location."}
            </p>
          </div>

          {hasSearched && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setPlaces([]);
                setHasSearched(false);
                setError("");
                setNotice("");
              }}
              className="flex items-center gap-2 text-sm font-semibold text-[#D96E9B] hover:text-pink-600"
            >
              <RotateCcw size={16} />
              Clear results
            </button>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-gray-500">
            <LoaderCircle
              size={40}
              className="animate-spin text-[#E78FB3]"
            />
            <p>Searching real locations...</p>
          </div>
        ) : places.length > 0 ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((place, index) => {
              const key = placeKey(place.name, place.country);
              const isFavorite = savedKeys.has(key);

              return (
                <motion.article
                  key={`${place.id}-${place.latitude}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  whileHover={{ y: -5 }}
                  className="overflow-hidden rounded-3xl border border-pink-100 bg-white p-6 shadow-lg transition hover:shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50">
                      <Globe2 size={29} className="text-[#E78FB3]" />
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleFavorite(place)}
                      aria-label={
                        isFavorite
                          ? `Remove ${place.name} from wishlist`
                          : `Save ${place.name} to wishlist`
                      }
                      aria-pressed={isFavorite}
                      className="rounded-full p-2 transition hover:bg-pink-50"
                    >
                      <Heart
                        size={23}
                        className={
                          isFavorite
                            ? "fill-pink-500 text-pink-500"
                            : "text-gray-400"
                        }
                      />
                    </button>
                  </div>

                  <h3 className="mt-5 text-2xl font-bold text-gray-900">
                    {place.name}
                  </h3>

                  <div className="mt-3 flex items-start gap-2 text-gray-500">
                    <MapPin
                      size={18}
                      className="mt-0.5 shrink-0 text-[#E78FB3]"
                    />
                    <span>
                      {place.admin1 ? `${place.admin1}, ` : ""}
                      {place.country}
                    </span>
                  </div>

                  <div className="mt-5 rounded-2xl bg-pink-50/70 p-4 text-sm text-gray-600">
                    <p>
                      <strong>Latitude:</strong>{" "}
                      {place.latitude.toFixed(4)}
                    </p>
                    <p className="mt-1">
                      <strong>Longitude:</strong>{" "}
                      {place.longitude.toFixed(4)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => openMap(place)}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E78FB3] px-5 py-3 font-semibold text-white transition hover:bg-pink-500"
                  >
                    View on map
                    <ExternalLink size={17} />
                  </button>

                  {isFavorite && (
                    <p className="mt-3 flex items-center justify-center gap-1.5 text-sm font-medium text-pink-600">
                      <Heart size={14} className="fill-pink-400" />
                      Saved to your wishlist
                    </p>
                  )}
                </motion.article>
              );
            })}
          </div>
        ) : (
          !loading &&
          !error && (
            <div className="mt-6 rounded-3xl border border-pink-100 bg-white px-6 py-14 text-center shadow-sm">
              <Globe2 className="mx-auto text-[#E78FB3]" size={44} />

              <h3 className="mt-4 text-xl font-bold text-gray-800">
                The world is waiting
              </h3>

              <p className="mt-2 text-gray-500">
                Search a destination above to see real location results.
              </p>
            </div>
          )
        )}

        <p className="mt-8 text-center text-xs text-gray-400">
          Location data provided by Open-Meteo Geocoding. Maps open
          OpenStreetMap. Ratings and hotel or flight prices are not supplied
          by this search.
        </p>
      </section>
    </main>
  );
}
