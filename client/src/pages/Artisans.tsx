import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Heart,
  ExternalLink,
  RefreshCw,
  Palette,
  Store,
  Sparkles,
  AlertCircle,
  Phone,
  Bookmark,
  Check,
  Compass,
  Globe,
} from "lucide-react";
import {
  getArtisans,
  discoverArtisans,
  saveArtisan,
  type Artisan,
} from "../services/artisanService";

const POPULAR_DESTINATIONS = [
  "Jaipur",
  "Varanasi",
  "Kutch",
  "Kyoto",
  "Venice",
  "Paris",
  "Oaxaca",
];

const demoArtisans: Artisan[] = [
  {
    _id: "demo-jaipur-1",
    name: "Rangilo Blue Pottery Studio",
    location: "Jaipur, Rajasthan, India",
    destination: "Jaipur",
    craft: "Blue Pottery",
    product: "Hand-painted pottery, decorative plates and vases",
    description:
      "Demo listing showcasing Rajasthan's traditional blue pottery craft.",
    price: "₹450 - ₹2,500",
    image:
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=80",
    source: "Demo listing",
    verifiedArtisan: false,
  },
  {
    _id: "demo-jaipur-2",
    name: "Pink City Block Print Studio",
    location: "Jaipur, Rajasthan, India",
    destination: "Jaipur",
    craft: "Block Printing",
    product: "Printed fabrics, scarves, tote bags and home textiles",
    description:
      "Demo listing representing Jaipur's colourful hand-block printing tradition.",
    price: "₹600 - ₹3,000",
    image:
      "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=900&q=80",
    source: "Demo listing",
    verifiedArtisan: false,
  },
  {
    _id: "demo-jaipur-3",
    name: "Traditional Lac Bangle Workshop",
    location: "Jaipur, Rajasthan, India",
    destination: "Jaipur",
    craft: "Lac Jewellery",
    product: "Colourful bangles and handcrafted jewellery",
    description:
      "Demo listing representing traditional Rajasthani jewellery-making.",
    price: "₹250 - ₹1,800",
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=80",
    source: "Demo listing",
    verifiedArtisan: false,
  },
];

export default function Artisans() {
  const [search, setSearch] = useState("");
  const [destination, setDestination] = useState("Jaipur");
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});
  const [cityOverview, setCityOverview] = useState("");
  const [activeDestination, setActiveDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [source, setSource] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Load saved profiles on page mount
  const loadSavedArtisans = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await getArtisans();
      setArtisans(data);
      setSource("MongoDB Database");
      setHasSearched(true);
      setCityOverview("");
      setActiveDestination("");

      if (data.length === 0) {
        setMessage(
          "No saved profiles found in database. Click 'Discover Live from Web' below to fetch real data from the net!"
        );
      } else {
        setMessage(`${data.length} saved artisan profile(s) loaded from your database.`);
      }
    } catch {
      setError("Could not load saved profiles. Ensure the backend server is running.");
      setArtisans([]);
      setSource("");
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSavedArtisans();
  }, []);

  // Search through saved database records
  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setHasSearched(true);

    try {
      const data = await getArtisans(search.trim());
      setArtisans(data);
      setSource("MongoDB Database");
      setCityOverview("");

      if (data.length === 0) {
        setMessage(
          "No saved records found for that term. Try 'Discover Live from Web' for real-time listings!"
        );
      } else {
        setMessage(`${data.length} match(es) found in database.`);
      }
    } catch {
      setError("Database search failed. Please verify your server connection.");
    } finally {
      setLoading(false);
    }
  };

  // Discover actual live data from the web for the destination city
  const runLiveDiscovery = async (targetCity: string) => {
    const city = targetCity.trim();
    if (!city) {
      setError("Please enter a destination city to discover artisans.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    setHasSearched(true);
    setActiveDestination(city);

    try {
      const result = await discoverArtisans(city);

      if (!result.success) {
        throw new Error(result.message || "Live discovery failed.");
      }

      const results = result.data || [];
      setArtisans(results);
      setSource(result.source || "Live Web & Heritage Registry");
      setCityOverview(result.overview || "");

      if (results.length === 0) {
        setMessage(
          `No live artisan listings found for ${city}. Try another city like Jaipur or Varanasi.`
        );
      } else {
        setMessage(
          `Found ${results.length} authentic artisan workshops & studios for ${city} from the net!`
        );
      }
    } catch (err: any) {
      console.error("Live discovery error:", err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Could not fetch live artisan data. Please check your connection.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscover = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runLiveDiscovery(destination);
  };

  const handleQuickDestination = (city: string) => {
    setDestination(city);
    void runLiveDiscovery(city);
  };

  // Save an individual artisan profile to MongoDB
  const handleSaveToDatabase = async (artisan: Artisan) => {
    try {
      await saveArtisan({
        name: artisan.name,
        craft: artisan.craft,
        product: artisan.product,
        location: artisan.location,
        destination: artisan.destination || destination,
        description: artisan.description,
        price: artisan.price,
        image: artisan.image,
        contact: artisan.contact,
        source: artisan.source || "Live Web Registry",
        sourceUrl: artisan.sourceUrl,
        verifiedArtisan: true,
      });

      setSavedIds((prev) => ({ ...prev, [artisan._id]: true }));
      setMessage(`"${artisan.name}" saved to your database!`);
    } catch (err: any) {
      console.error("Save error:", err);
      setError("Failed to save artisan to database.");
    }
  };

  const showDemoCards = () => {
    const place = destination.trim().toLowerCase();
    const matches = demoArtisans.filter(
      (a) => !place || place.includes("jaipur") || a.destination.toLowerCase().includes(place)
    );
    setArtisans(matches.length > 0 ? matches : demoArtisans);
    setSource("Demonstration Data");
    setError("");
    setCityOverview("");
    setHasSearched(true);
    setMessage("Viewing sample demo listings. Click 'Discover Live from Web' for real net data.");
  };

  const toggleWishlist = (id: string) => {
    setWishlist((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const displayedArtisans = artisans.filter((artisan) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return `${artisan.name} ${artisan.craft} ${artisan.product} ${artisan.location}`
      .toLowerCase()
      .includes(term);
  });

  return (
    <div className="min-h-screen bg-[#fff8fb] px-4 py-8 text-[#492b3b] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white px-4 py-2 text-sm font-medium text-[#b84f7c] shadow-sm">
            <Sparkles size={16} />
            Live Cultural Heritage & Master Artisans
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Discover Local Artisans
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#8d7180] sm:text-base">
            Explore authentic traditional crafts, master artisan studios, handmade treasures,
            and heritage workshops fetched live from the web for any city.
          </p>

          {/* Quick city selection pills */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7d8c]">
              Popular Craft Cities:
            </span>
            {POPULAR_DESTINATIONS.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => handleQuickDestination(city)}
                disabled={loading}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition ${
                  destination.toLowerCase() === city.toLowerCase()
                    ? "bg-[#d96899] text-white shadow-sm"
                    : "border border-pink-200 bg-white text-[#86556d] hover:bg-pink-50"
                } disabled:opacity-50`}
              >
                {city}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Search & Discovery Forms */}
        <div className="mb-8 grid gap-5 lg:grid-cols-2">
          {/* Live Web Discovery Form */}
          <form
            onSubmit={handleDiscover}
            className="rounded-3xl border border-pink-100 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-pink-50 p-3 text-[#c65b89]">
                <Globe size={21} />
              </div>
              <div>
                <h2 className="font-semibold">Discover Live from Web</h2>
                <p className="text-sm text-[#9a7d8c]">
                  Fetch authentic real-world artisan studios for any city
                </p>
              </div>
            </div>

            <label
              htmlFor="artisan-destination"
              className="mb-2 block text-sm font-medium"
            >
              Destination City
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <MapPin
                  size={18}
                  className="absolute left-3.5 top-3.5 text-[#b07891]"
                />
                <input
                  id="artisan-destination"
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  placeholder="e.g. Jaipur, Varanasi, Kyoto, Paris"
                  className="w-full rounded-xl border border-pink-100 bg-[#fffafd] pl-10 pr-4 py-3 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !destination.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#d96899] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#bd4e80] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={17} />
                ) : (
                  <Search size={17} />
                )}
                Discover Live
              </button>
            </div>
          </form>

          {/* Database Search Form */}
          <form
            onSubmit={handleSearch}
            className="rounded-3xl border border-pink-100 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-pink-50 p-3 text-[#c65b89]">
                <Store size={21} />
              </div>
              <div>
                <h2 className="font-semibold">Search Saved Database</h2>
                <p className="text-sm text-[#9a7d8c]">
                  Query records saved in your MongoDB collection
                </p>
              </div>
            </div>

            <label
              htmlFor="artisan-search"
              className="mb-2 block text-sm font-medium"
            >
              Craft, product or artisan name
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="artisan-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="e.g. pottery, jewellery, handloom"
                className="min-w-0 flex-1 rounded-xl border border-pink-100 bg-[#fffafd] px-4 py-3 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-pink-200 bg-white px-5 py-3 font-semibold text-[#b84f7c] transition hover:bg-pink-50 disabled:opacity-60"
              >
                <Search size={17} />
                Search DB
              </button>
            </div>
          </form>
        </div>

        {/* City Cultural Overview Banner */}
        <AnimatePresence>
          {cityOverview && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 rounded-3xl border border-pink-200 bg-gradient-to-r from-pink-50/80 via-white to-pink-50/40 p-5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-[#fbe4ef] p-2.5 text-[#b84f7c] shadow-xs">
                  <Compass size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#743555]">
                      {activeDestination || destination} Craft Heritage & Tradition
                    </h3>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                      Live Web Verified
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-6 text-[#705261]">
                    {cityOverview}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification / Status Alerts */}
        {(error || message) && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 ${
              error
                ? "border-red-200 bg-red-50 text-red-900"
                : "border-pink-100 bg-white text-[#86556d]"
            }`}
          >
            {error ? (
              <AlertCircle className="mt-0.5 shrink-0 text-red-600" size={19} />
            ) : (
              <Sparkles className="mt-0.5 shrink-0 text-[#c65b89]" size={19} />
            )}
            <div className="min-w-0 flex-1 text-sm leading-6">
              <p className="font-medium">{error || message}</p>
              {error && (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => void runLiveDiscovery(destination)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 font-semibold text-red-800 transition hover:bg-red-200"
                  >
                    <RefreshCw size={14} /> Retry Live Search
                  </button>
                  <button
                    type="button"
                    onClick={() => void loadSavedArtisans()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-pink-200 bg-white px-3 py-1.5 font-semibold text-[#86556d] transition hover:bg-pink-50"
                  >
                    Load Saved Profiles
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Bar */}
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold">Artisan Collections</h2>
            <p className="mt-1 text-sm text-[#9a7d8c]">
              {displayedArtisans.length} workshop(s)
              {source ? ` · Source: ${source}` : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void runLiveDiscovery(destination)}
              disabled={loading || !destination.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#fbe3ee] px-4 py-2.5 text-sm font-semibold text-[#b84f7c] transition hover:bg-[#f8d0e2] disabled:opacity-60"
            >
              <Globe size={15} />
              Refresh from Web
            </button>

            <button
              type="button"
              onClick={() => void loadSavedArtisans()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#b84f7c] hover:bg-pink-50 disabled:opacity-60"
            >
              <RefreshCw size={15} />
              View Saved Database
            </button>

            <button
              type="button"
              onClick={showDemoCards}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-pink-100 bg-white px-4 py-2.5 text-sm font-semibold text-[#a84270] hover:bg-pink-50"
            >
              <Palette size={16} />
              Demo Cards
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="mb-8 flex items-center justify-center gap-3 rounded-3xl border border-pink-100 bg-white p-8 text-[#9a6480] shadow-sm">
            <RefreshCw className="animate-spin text-[#d96899]" size={22} />
            <span className="font-medium text-base">
              Fetching real-time artisan data & authentic craft records for {destination}...
            </span>
          </div>
        )}

        {/* Artisan Cards Grid */}
        {!loading && displayedArtisans.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {displayedArtisans.map((artisan, index) => {
              const isSaved = Boolean(savedIds[artisan._id]);

              return (
                <motion.article
                  key={artisan._id || index}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="flex flex-col overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-100/70"
                >
                  {/* Card Image Area */}
                  <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-pink-100 via-[#fff0f6] to-[#f4d9e7]">
                    {artisan.image ? (
                      <img
                        src={artisan.image}
                        alt={artisan.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#cf78a0]">
                        <Palette size={48} strokeWidth={1.3} />
                      </div>
                    )}

                    {/* Status Badges */}
                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                      {artisan.source === "Demo listing" || artisan.source === "Demonstration Data" ? (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 shadow-xs">
                          DEMO LISTING
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-semibold text-white shadow-xs backdrop-blur-xs">
                          ✓ Verified Heritage
                        </span>
                      )}

                      {artisan.destination && (
                        <span className="rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-xs">
                          {artisan.destination}
                        </span>
                      )}
                    </div>

                    {/* Wishlist Heart Button */}
                    <button
                      type="button"
                      onClick={() => toggleWishlist(artisan._id)}
                      aria-label={
                        wishlist.includes(artisan._id)
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                      className="absolute right-3 top-3 rounded-full bg-white/95 p-2.5 text-[#c65b89] shadow-sm transition hover:scale-105"
                    >
                      <Heart
                        size={18}
                        fill={
                          wishlist.includes(artisan._id)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  </div>

                  {/* Card Content Area */}
                  <div className="flex flex-1 flex-col p-5">
                    {/* Craft Badge */}
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#c65b89]">
                      <Palette size={14} />
                      {artisan.craft || "Traditional Craft"}
                    </div>

                    {/* Workshop Name */}
                    <h3 className="text-lg font-bold leading-snug text-[#3c1e2f]">
                      {artisan.name}
                    </h3>

                    {/* Location */}
                    <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-[#8d7180]">
                      <MapPin size={15} className="mt-0.5 shrink-0 text-[#c65b89]" />
                      <span>{artisan.location || artisan.destination}</span>
                    </p>

                    {/* Description */}
                    <p className="mt-3 flex-1 text-sm leading-6 text-[#795f6d]">
                      {artisan.description ||
                        "Traditional artisan workshop dedicated to preserving heritage craft and handmade techniques."}
                    </p>

                    {/* Products Box */}
                    <div className="mt-4 rounded-2xl bg-[#fff5f9] p-3 border border-pink-50">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#b07891]">
                        Handmade Specialization
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#4e273d]">
                        {artisan.product || artisan.craft}
                      </p>
                    </div>

                    {/* Price and Contact Info */}
                    <div className="mt-3 space-y-1.5">
                      {artisan.price && (
                        <p className="text-sm font-bold text-[#a84270]">
                          Est. Price: {artisan.price}
                        </p>
                      )}

                      {artisan.contact && (
                        <p className="flex items-center gap-1.5 text-xs text-[#8d7180]">
                          <Phone size={13} className="shrink-0 text-[#c65b89]" />
                          <span className="truncate">{artisan.contact}</span>
                        </p>
                      )}
                    </div>

                    {/* Card Actions Footer */}
                    <div className="mt-5 flex items-center justify-between border-t border-pink-50 pt-4">
                      {/* Save to DB button */}
                      <button
                        type="button"
                        onClick={() => void handleSaveToDatabase(artisan)}
                        disabled={isSaved}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
                          isSaved
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                            : "bg-[#fff2f7] text-[#a84270] hover:bg-[#fce5f0] border border-pink-100"
                        }`}
                      >
                        {isSaved ? <Check size={13} /> : <Bookmark size={13} />}
                        {isSaved ? "Saved in DB" : "Save to DB"}
                      </button>

                      {/* External Map/Source Link */}
                      {artisan.sourceUrl ? (
                        <a
                          href={artisan.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c65b89] hover:text-[#a84270] transition"
                        >
                          Locate on Map
                          <ExternalLink size={13} />
                        </a>
                      ) : (
                        <span className="text-xs text-[#a38a98]">
                          {artisan.source || "Database Record"}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && displayedArtisans.length === 0 && (
          <div className="rounded-3xl border border-dashed border-pink-200 bg-white px-5 py-12 text-center shadow-xs">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-[#c65b89]">
              <Store size={26} />
            </div>

            <h3 className="text-lg font-bold">
              {hasSearched
                ? "No artisan listings found"
                : "Discover Authentic Handmade Crafts"}
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#9a7d8c]">
              Click below to fetch real, authentic artisan workshops and studios from the web for{" "}
              <span className="font-semibold text-[#86556d]">{destination}</span>!
            </p>

            <button
              type="button"
              onClick={() => void runLiveDiscovery(destination)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#d96899] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#bd4e80]"
            >
              <Globe size={17} />
              Fetch Real Artisans from the Web
            </button>
          </div>
        )}

        {wishlist.length > 0 && (
          <p className="mt-6 text-sm text-[#9a7d8c]">
            <Heart
              size={15}
              className="mr-1 inline text-[#c65b89]"
              fill="currentColor"
            />
            {wishlist.length} artisan(s) bookmarked in your session wishlist.
          </p>
        )}

        <p className="mt-8 text-center text-xs leading-5 text-[#ad91a0]">
          Live artisan listings are dynamically retrieved from verified cultural heritage records,
          OpenStreetMap coordinates, and Wikimedia documentation for the selected destination.
        </p>
      </div>
    </div>
  );
}