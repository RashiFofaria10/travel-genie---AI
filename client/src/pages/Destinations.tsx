
import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  ArrowRight,
  Search,
  LoaderCircle,
  Globe2,
  ExternalLink,
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

const POPULAR_SEARCHES = [
  "Bali",
  "Kyoto",
  "Paris",
  "Dubai",
  "Zurich",
  "Maldives",
];

async function searchDestinations(query: string): Promise<Destination[]> {
  const params = new URLSearchParams({
    name: query,
    count: "12",
    language: "en",
    format: "json",
  });

  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?${params}`
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

export default function Destinations() {
  const [query, setQuery] = useState("");
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPopularDestinations() {
      setLoading(true);
      setError("");

      try {
        const results = await Promise.all(
          POPULAR_SEARCHES.map((name) => searchDestinations(name))
        );

        if (!cancelled) {
          const unique = new Map<number, Destination>();

          results.forEach((places) => {
            const exact = places.find(
              (place) => place.name.toLowerCase() ===
                POPULAR_SEARCHES[results.indexOf(places)].toLowerCase()
            );
            const chosen = exact ?? places[0];

            if (chosen) unique.set(chosen.id, chosen);
          });

          setDestinations(Array.from(unique.values()));
        }
      } catch {
        if (!cancelled) {
          setError(
            "We couldn't load destinations. Check your internet connection and try again."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPopularDestinations();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = query.trim();

    if (!value) {
      setError("Enter a city or destination to search.");
      return;
    }

    setSearching(true);
    setError("");
    setSearched(true);

    try {
      const results = await searchDestinations(value);
      setDestinations(results);

      if (results.length === 0) {
        setError("No matching destinations found. Try another name.");
      }
    } catch {
      setError("Search failed. Please check your connection and try again.");
    } finally {
      setSearching(false);
    }
  }

  function openMap(place: Destination) {
    const url = `https://www.openstreetmap.org/?mlat=${place.latitude}&mlon=${place.longitude}#map=12/${place.latitude}/${place.longitude}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="bg-gradient-to-b from-pink-50 via-white to-pink-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#E78FB3]">
            Explore the world
          </p>

          <h2 className="mt-4 text-4xl font-bold text-gray-900 sm:text-5xl">
            Find Your Next <span className="text-[#E78FB3]">Adventure</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500">
            Search real cities and destinations, discover their locations, and
            open them on the map.
          </p>
        </motion.div>

        <form
          onSubmit={handleSearch}
          className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row"
        >
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-pink-100 bg-white px-4 shadow-sm">
            <Search className="shrink-0 text-[#E78FB3]" size={21} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Paris, Tokyo, Ahmedabad..."
              aria-label="Search destinations"
              className="w-full bg-transparent py-4 text-gray-800 outline-none placeholder:text-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={searching}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#E78FB3] px-7 py-4 font-semibold text-white transition hover:bg-pink-500 disabled:opacity-60"
          >
            {searching ? (
              <LoaderCircle size={20} className="animate-spin" />
            ) : (
              <Search size={20} />
            )}
            Search
          </button>
        </form>

        {error && (
          <div
            role="alert"
            className="mx-auto mt-5 max-w-2xl rounded-2xl border border-pink-200 bg-white p-4 text-center text-sm text-gray-700"
          >
            {error}
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSearched(false);
                setError("");
                setLoading(true);
                Promise.all(
                  POPULAR_SEARCHES.map((name) => searchDestinations(name))
                )
                  .then((results) => {
                    const unique = new Map<number, Destination>();
                    results.forEach((places, index) => {
                      const chosen =
                        places.find(
                          (place) =>
                            place.name.toLowerCase() ===
                            POPULAR_SEARCHES[index].toLowerCase()
                        ) ?? places[0];
                      if (chosen) unique.set(chosen.id, chosen);
                    });
                    setDestinations(Array.from(unique.values()));
                  })
                  .catch(() => setError("Unable to reload destinations."))
                  .finally(() => setLoading(false));
              }}
              className="ml-2 font-bold text-[#D96E9B] underline"
            >
              Reset
            </button>
          </div>
        )}

        <div className="mt-10 flex items-center justify-between gap-3">
          <h3 className="text-xl font-bold text-gray-800">
            {searched ? "Search results" : "Popular destinations"}
          </h3>
          <span className="text-sm text-gray-500">
            {destinations.length} {destinations.length === 1 ? "place" : "places"}
          </span>
        </div>

        {loading || searching ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-gray-500">
            <LoaderCircle className="animate-spin text-[#E78FB3]" size={40} />
            <p>Finding real destinations...</p>
          </div>
        ) : destinations.length > 0 ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((place, index) => (
              <motion.article
                key={`${place.id}-${place.latitude}`}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                whileHover={{ y: -5 }}
                className="flex flex-col rounded-3xl border border-pink-100 bg-white p-7 shadow-lg transition hover:shadow-xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50">
                  <Globe2 className="text-[#E78FB3]" size={29} />
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
                    {place.countryCode ? ` (${place.countryCode})` : ""}
                  </span>
                </div>

                <div className="mt-4 rounded-2xl bg-pink-50/70 p-4 text-sm text-gray-600">
                  <p>
                    <span className="font-semibold text-gray-800">
                      Latitude:
                    </span>{" "}
                    {place.latitude.toFixed(4)}
                  </p>
                  <p className="mt-1">
                    <span className="font-semibold text-gray-800">
                      Longitude:
                    </span>{" "}
                    {place.longitude.toFixed(4)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => openMap(place)}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E78FB3] py-3 font-semibold text-white transition hover:bg-pink-500"
                >
                  View on map
                  <ExternalLink size={17} />
                  <ArrowRight size={17} />
                </button>
              </motion.article>
            ))}
          </div>
        ) : (
          !loading &&
          !searching && (
            <div className="mt-6 rounded-3xl bg-white px-6 py-14 text-center shadow-sm">
              <MapPin className="mx-auto text-[#E78FB3]" size={40} />
              <h3 className="mt-4 text-xl font-bold text-gray-800">
                No destinations to show
              </h3>
              <p className="mt-2 text-gray-500">
                Search for a city or try one of the popular destinations.
              </p>
            </div>
          )
        )}

        <p className="mt-8 text-center text-xs text-gray-400">
          Location data provided by Open-Meteo Geocoding. Map links open
          OpenStreetMap. Coordinates identify locations; they do not represent
          ratings or travel recommendations.
        </p>
      </div>
    </section>
  );
}
