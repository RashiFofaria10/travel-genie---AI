import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  CalendarDays,
  Users,
  ExternalLink,
  Hotel,
  Star,
  Sparkles,
  RefreshCw,
  Building,
} from "lucide-react";
import { searchHotels, type HotelOption } from "../services/hotelService";

const POPULAR_HOTEL_CITIES = [
  "Goa",
  "Jaipur",
  "Paris",
  "Tokyo",
  "Dubai",
  "Manali",
  "Udaipur",
];

export default function Hotels() {
  const [destination, setDestination] = useState("Goa");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [hotels, setHotels] = useState<HotelOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const handleSearchHotels = async (targetDest?: string) => {
    const city = (targetDest || destination).trim();
    if (!city) {
      setError("Please enter a destination city.");
      return;
    }

    if (checkIn && checkOut && checkOut <= checkIn) {
      setError("Check-out date must be after check-in date.");
      return;
    }

    setError("");
    setLoading(true);
    setSearched(true);

    try {
      const response = await searchHotels(city);
      if (!response.success) {
        throw new Error(response.message || "Failed to search hotels.");
      }
      setHotels(response.hotels || []);
    } catch (err: any) {
      console.error("Hotel search error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not retrieve hotel listings. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSearchHotels();
  };

  const handleQuickCity = (city: string) => {
    setDestination(city);
    void handleSearchHotels(city);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50/50 via-white to-pink-50/30 pb-16">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-5 pt-8 sm:px-6 lg:pt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white px-3.5 py-1 text-xs font-bold text-[#b84f7c] shadow-xs">
            <Sparkles size={15} />
            Verified Accommodations & Boutique Stays
          </div>

          <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Find Your <span className="text-[#E78FB3]">Perfect Stay</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
            Discover real, highly rated hotels, heritage palace resorts, and boutique stays
            with live pricing, guest ratings, amenities, and direct booking links.
          </p>

          {/* Quick city suggestions */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7d8c]">
              Popular Destinations:
            </span>
            {POPULAR_HOTEL_CITIES.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => handleQuickCity(city)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition ${
                  destination.toLowerCase() === city.toLowerCase()
                    ? "bg-[#d96899] text-white shadow-xs"
                    : "border border-pink-200 bg-white text-[#705261] hover:bg-pink-50"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Search Form */}
      <section className="mx-auto max-w-7xl px-5 sm:px-6">
        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={onSubmit}
          className="rounded-3xl border border-pink-100 bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="rounded-2xl bg-pink-50 p-3 text-[#d96899]">
              <Hotel size={22} />
            </span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Search Live Accommodations</h2>
              <p className="text-xs text-gray-500">
                Choose destination city and travel schedule
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9a7d8c]">
                <MapPin size={15} className="text-[#c65b89]" /> Destination
              </span>
              <input
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                placeholder="e.g. Goa, Jaipur, Paris, Tokyo"
                className="w-full rounded-xl border border-pink-100 bg-[#fffafd] p-3.5 text-sm text-gray-900 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9a7d8c]">
                <CalendarDays size={15} className="text-[#c65b89]" /> Check-in Date
              </span>
              <input
                type="date"
                min={today}
                value={checkIn}
                onChange={(event) => setCheckIn(event.target.value)}
                className="w-full rounded-xl border border-pink-100 bg-[#fffafd] p-3.5 text-sm text-gray-900 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9a7d8c]">
                <CalendarDays size={15} className="text-[#c65b89]" /> Check-out Date
              </span>
              <input
                type="date"
                min={checkIn || today}
                value={checkOut}
                onChange={(event) => setCheckOut(event.target.value)}
                className="w-full rounded-xl border border-pink-100 bg-[#fffafd] p-3.5 text-sm text-gray-900 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9a7d8c]">
                <Users size={15} className="text-[#c65b89]" /> Guests
              </span>
              <select
                value={guests}
                onChange={(event) => setGuests(event.target.value)}
                className="w-full rounded-xl border border-pink-100 bg-[#fffafd] p-3.5 text-sm text-gray-900 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              >
                <option value="1">1 Guest</option>
                <option value="2">2 Guests (1 Room)</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests (Family)</option>
                <option value="5+">5+ Guests (Group)</option>
              </select>
            </label>
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading || !destination.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#d96899] px-6 py-3.5 font-bold text-white shadow-sm transition hover:bg-[#bd4e80] disabled:opacity-60"
            >
              {loading ? (
                <RefreshCw className="animate-spin" size={17} />
              ) : (
                <Search size={17} />
              )}
              Search Live Hotels
            </button>
          </div>
        </motion.form>
      </section>

      {/* Results Section */}
      <section className="mx-auto max-w-7xl px-5 pt-12 sm:px-6">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-black text-gray-900">
              {searched
                ? `Available Accommodations in ${destination.trim()}`
                : "Top Recommended Stays"}
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {hotels.length > 0
                ? `Showing ${hotels.length} verified hotel properties with live booking links`
                : "Search a destination above to see real hotels with prices and ratings"}
            </p>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex items-center justify-center gap-3 rounded-3xl border border-pink-100 bg-white p-12 text-[#9a6480] shadow-sm">
            <RefreshCw className="animate-spin text-[#d96899]" size={24} />
            <span className="font-medium text-base">
              Fetching real hotel rates and properties in {destination}...
            </span>
          </div>
        )}

        {/* Hotel Cards Grid */}
        {!loading && hotels.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {hotels.map((hotel, index) => (
              <motion.article
                key={hotel.id || index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group flex flex-col overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-100/60"
              >
                {/* Photo */}
                <div className="relative h-56 overflow-hidden bg-pink-100">
                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#b84f7c] shadow-xs backdrop-blur-xs">
                    {hotel.type}
                  </span>

                  <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-amber-300 backdrop-blur-xs">
                    <Star size={12} fill="currentColor" />
                    <span>{hotel.rating}</span>
                    <span className="text-[10px] text-gray-300">({hotel.reviewsCount})</span>
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-bold leading-snug text-gray-900">
                    {hotel.name}
                  </h3>

                  <p className="mt-1.5 flex items-start gap-1.5 text-xs text-[#8d7180]">
                    <MapPin size={14} className="mt-0.5 shrink-0 text-[#c65b89]" />
                    <span>{hotel.location}</span>
                  </p>

                  <p className="mt-3 flex-1 text-sm leading-6 text-gray-600">
                    {hotel.description}
                  </p>

                  {/* Amenities */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {hotel.amenities.map((amenity, i) => (
                      <span
                        key={i}
                        className="rounded-lg bg-[#fff5f9] px-2.5 py-1 text-[11px] font-semibold text-[#b07891] border border-pink-50"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>

                  {/* Pricing and Booking */}
                  <div className="mt-5 flex items-center justify-between border-t border-pink-50 pt-4">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#9a7d8c]">Estimated Rate</p>
                      <p className="text-base font-black text-[#a84270]">
                        {hotel.pricePerNight}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={hotel.bookingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-xl bg-[#d96899] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#bd4e80]"
                      >
                        View Rates
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* Empty state before searching */}
        {!loading && hotels.length === 0 && !searched && (
          <div className="rounded-3xl border border-dashed border-pink-200 bg-white p-12 text-center shadow-xs">
            <Building size={32} className="mx-auto text-[#c65b89] mb-3" />
            <h3 className="text-lg font-bold text-gray-900">Ready to find a stay?</h3>
            <p className="mt-1 text-sm text-gray-500">
              Click "Search Live Hotels" above to discover genuine properties in {destination}.
            </p>
            <button
              type="button"
              onClick={() => void handleSearchHotels()}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#d96899] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#bd4e80] transition"
            >
              <Search size={14} /> Search {destination} Hotels
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
