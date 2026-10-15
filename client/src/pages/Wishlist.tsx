
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  MapPin,
  Star,
  Trash2,
  Plane,
  Plus,
  Search,
  X,
  Compass,
  ArrowUpRight,
} from "lucide-react";

type WishlistPlace = {
  id: string;
  destination: string;
  country: string;
  rating: number | null;
  image: string;
  budget: string;
};

const STORAGE_KEY = "travel-genie-wishlist";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200";

function loadWishlist(): WishlistPlace[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === null) return [];

    const parsed: unknown = JSON.parse(saved);

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

export default function Wishlist() {
  const [wishlist, setWishlist] = useState<WishlistPlace[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [destination, setDestination] = useState("");
  const [country, setCountry] = useState("");
  const [budget, setBudget] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");

  // Load saved destinations on first render.
  useEffect(() => {
    setWishlist(loadWishlist());
    setLoaded(true);
  }, []);

  // Persist changes in this browser.
  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
      setError(
        "Your browser could not save the wishlist. Check available storage."
      );
    }
  }, [wishlist, loaded]);

  const filteredWishlist = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return wishlist;

    return wishlist.filter(
      (place) =>
        place.destination.toLowerCase().includes(query) ||
        place.country.toLowerCase().includes(query)
    );
  }, [wishlist, search]);

  const removePlace = (id: string) => {
    setWishlist((previous) =>
      previous.filter((place) => place.id !== id)
    );
    setError("");
  };

  const addPlace = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const name = destination.trim();
    const countryName = country.trim();

    if (!name || !countryName) {
      setError("Please enter both the destination and country.");
      return;
    }

    const duplicate = wishlist.some(
      (place) =>
        place.destination.toLowerCase() === name.toLowerCase() &&
        place.country.toLowerCase() === countryName.toLowerCase()
    );

    if (duplicate) {
      setError("This destination is already in your wishlist.");
      return;
    }

    const newPlace: WishlistPlace = {
      id: crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      destination: name,
      country: countryName,
      rating: null,
      image: image.trim() || FALLBACK_IMAGE,
      budget: budget.trim() || "Not estimated",
    };

    setWishlist((previous) => [newPlace, ...previous]);

    setDestination("");
    setCountry("");
    setBudget("");
    setImage("");
    setSearch("");
    setShowForm(false);
  };

 const planTrip = (place: {
  destination: string;
  country: string;
}) => {
  const destination = `${place.destination}, ${place.country}`;

  const query = new URLSearchParams({
    destination: destination,
  });

  window.location.href = `/mytrips?${query.toString()}`;
};

  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-pink-50">
        <div className="text-center">
          <Heart
            size={36}
            className="mx-auto animate-pulse fill-pink-300 text-pink-400"
          />
          <p className="mt-3 font-semibold text-gray-600">
            Loading your wishlist...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-5 pt-12 sm:px-8 sm:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-pink-100/70 px-5 py-2 font-semibold text-pink-600">
            <Heart size={18} className="fill-pink-400" />
            Your travel dreams, saved
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            My <span className="text-[#E78FB3]">Wishlist</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
            Keep your favourite destinations close. Save the places you dream
            of visiting and plan your next adventure when you are ready.
          </p>
        </motion.div>
      </section>

      {/* Summary */}
      <section className="mx-auto max-w-7xl px-5 pt-9 sm:px-8">
        <div className="flex flex-col justify-between gap-5 rounded-[28px] border border-pink-100 bg-white p-5 shadow-lg shadow-pink-100/40 sm:flex-row sm:items-center sm:p-7">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-100 text-[#E78FB3]">
              <Heart size={27} className="fill-pink-200" />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500">
                Your saved destinations
              </p>
              <p className="mt-1 text-2xl font-black text-gray-900">
                {wishlist.length}{" "}
                <span className="text-base font-medium text-gray-500">
                  {wishlist.length === 1 ? "destination" : "destinations"}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowForm((previous) => !previous);
              setError("");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E78FB3] px-6 py-3.5 font-bold text-white shadow-md shadow-pink-200 transition hover:bg-pink-500"
          >
            {showForm ? <X size={19} /> : <Plus size={19} />}
            {showForm ? "Cancel" : "Add destination"}
          </button>
        </div>
      </section>

      {/* Add destination form */}
      {showForm && (
        <section className="mx-auto max-w-7xl px-5 pt-6 sm:px-8">
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={addPlace}
            className="rounded-[28px] border border-pink-100 bg-white p-5 shadow-lg sm:p-7"
          >
            <h2 className="text-xl font-bold text-gray-900">
              Add a dream destination
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Add a place you would love to visit. Budget and image are optional.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <input
                required
                maxLength={100}
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                placeholder="Destination name *"
                className="rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              />

              <input
                required
                maxLength={100}
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                placeholder="Country *"
                className="rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              />

              <input
                maxLength={100}
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                placeholder="Estimated budget (e.g. ₹50,000)"
                className="rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              />

              <input
                type="url"
                maxLength={2000}
                value={image}
                onChange={(event) => setImage(event.target.value)}
                placeholder="Image URL (optional)"
                className="rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            {error && (
              <p role="alert" className="mt-4 text-sm font-medium text-red-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#E78FB3] px-6 py-3 font-bold text-white transition hover:bg-pink-500"
            >
              <Plus size={18} />
              Save destination
            </button>
          </motion.form>
        </section>
      )}

      {/* Search */}
      <section className="mx-auto max-w-7xl px-5 pt-8 sm:px-8">
        <div className="relative max-w-xl">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search destinations or countries..."
            aria-label="Search wishlist destinations"
            className="w-full rounded-2xl border border-pink-100 bg-white py-4 pl-12 pr-4 text-gray-700 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
          />
        </div>
      </section>

      {/* Destination cards */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12">
        {error && !showForm && (
          <p role="alert" className="mb-5 text-sm font-medium text-red-500">
            {error}
          </p>
        )}

        {filteredWishlist.length > 0 ? (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {filteredWishlist.map((place, index) => (
              <motion.article
                key={place.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.06, 0.3) }}
                whileHover={{ y: -5 }}
                className="group overflow-hidden rounded-[28px] border border-pink-100 bg-white shadow-lg shadow-pink-100/40 transition-shadow hover:shadow-xl"
              >
                <div className="relative h-56 overflow-hidden bg-pink-100">
                  <img
                    src={place.image || FALLBACK_IMAGE}
                    alt={place.destination}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = FALLBACK_IMAGE;
                    }}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

                  <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-xs font-bold text-pink-600 shadow-sm">
                    <Heart size={14} className="fill-pink-400" />
                    Saved destination
                  </div>

                  <button
                    type="button"
                    onClick={() => removePlace(place.id)}
                    aria-label={`Remove ${place.destination} from wishlist`}
                    title="Remove from wishlist"
                    className="absolute right-4 top-4 rounded-xl bg-white/95 p-2.5 text-gray-600 shadow-sm transition hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="absolute bottom-4 left-5 right-5">
                    <h2 className="text-3xl font-black text-white drop-shadow-md">
                      {place.destination}
                    </h2>
                    <div className="mt-2 flex items-center gap-2 text-sm font-medium text-white/95">
                      <MapPin size={16} />
                      {place.country}
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Star
                        size={18}
                        className="fill-yellow-400 text-yellow-400"
                      />
                      <span className="font-semibold">
                        {typeof place.rating === "number"
                          ? place.rating.toFixed(1)
                          : "Not rated"}
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-400">
                        Estimated budget
                      </p>
                      <p className="mt-1 text-xl font-black text-[#E78FB3]">
                        {place.budget || "Not estimated"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => planTrip(place)}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E78FB3] py-3.5 font-bold text-white transition hover:bg-pink-500"
                  >
                    <Plane size={18} />
                    Plan Trip
                    <ArrowUpRight size={17} className="ml-auto mr-2" />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[30px] border border-dashed border-pink-200 bg-white/80 px-5 py-16 text-center"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-pink-100 text-[#E78FB3]">
              {search ? <Search size={34} /> : <Compass size={36} />}
            </div>

            <h2 className="mt-6 text-2xl font-black text-gray-900">
              {search ? "No destinations found" : "Your wishlist is waiting"}
            </h2>

            <p className="mx-auto mt-3 max-w-md leading-7 text-gray-500">
              {search
                ? "Try another destination or country, or clear your search."
                : "Start collecting the places you have always dreamed of visiting. Your next adventure begins here."}
            </p>

            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-6 rounded-xl border border-pink-200 px-5 py-3 font-semibold text-pink-600 transition hover:bg-pink-50"
              >
                Clear search
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#E78FB3] px-6 py-3 font-bold text-white transition hover:bg-pink-500"
              >
                <Plus size={18} />
                Add your first destination
              </button>
            )}
          </motion.div>
        )}
      </section>

      <footer className="pb-8 text-center text-sm text-gray-400">
        Your next favourite place is waiting ♡
      </footer>
    </main>
  );
}
