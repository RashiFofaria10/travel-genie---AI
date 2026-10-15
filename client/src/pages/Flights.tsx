import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plane,
  ArrowRight,
  Search,
  Clock3,
  CalendarDays,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Users,
} from "lucide-react";
import { searchFlights, type FlightOption } from "../services/flightService";

const POPULAR_FLIGHT_ROUTES = [
  { from: "DEL", to: "BOM", label: "Delhi → Mumbai" },
  { from: "AMD", to: "DXB", label: "Ahmedabad → Dubai" },
  { from: "BLR", to: "GOI", label: "Bangalore → Goa" },
  { from: "BOM", to: "LHR", label: "Mumbai → London" },
  { from: "JFK", to: "LHR", label: "New York → London" },
  { from: "DEL", to: "CDG", label: "Delhi → Paris" },
];

export default function Flights() {
  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  const [from, setFrom] = useState("DEL");
  const [to, setTo] = useState("BOM");
  const [date, setDate] = useState(minDate);
  const [passengers, setPassengers] = useState(1);
  const [travelClass, setTravelClass] = useState("ECONOMY");
  const [flights, setFlights] = useState<FlightOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [bookingUrl, setBookingUrl] = useState("");

  const handleFlightSearch = async (overrideFrom?: string, overrideTo?: string) => {
    const origin = (overrideFrom || from).trim().toUpperCase();
    const destination = (overrideTo || to).trim().toUpperCase();

    if (!origin || !destination) {
      setError("Please specify both origin and destination.");
      return;
    }

    if (origin === destination) {
      setError("Departure and destination locations must be different.");
      return;
    }

    setError("");
    setLoading(true);
    setSearched(true);

    try {
      const res = await searchFlights({
        from: origin,
        to: destination,
        departureDate: date,
        adults: passengers,
        travelClass,
      });

      if (!res.success) {
        throw new Error(res.message || "Failed to search flights.");
      }

      setFlights(res.flights || []);
      setBookingUrl(
        res.bookingUrl ||
          `https://www.google.com/travel/flights?q=flights%20from%20${origin}%20to%20${destination}`
      );
    } catch (err: any) {
      console.error("Flight error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Flight search failed. Please verify your internet connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleFlightSearch();
  };

  const handleSelectPopular = (f: string, t: string) => {
    setFrom(f);
    setTo(t);
    void handleFlightSearch(f, t);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50/50 via-white to-pink-50/30 pb-16">
      {/* Header */}
      <section className="mx-auto max-w-7xl px-5 pt-8 sm:px-6 lg:pt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white px-3.5 py-1 text-xs font-bold text-[#b84f7c] shadow-xs">
            <Sparkles size={15} />
            Global Airline Intelligence & Live Routes
          </div>

          <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Search & Compare <span className="text-[#E78FB3]">Flights</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
            Find actual airline schedules, non-stop connections, cabin options,
            and estimated market fares for any domestic or international flight route.
          </p>

          {/* Quick Route Buttons */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9a7d8c]">
              Popular Routes:
            </span>
            {POPULAR_FLIGHT_ROUTES.map((route, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectPopular(route.from, route.to)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition ${
                  from === route.from && to === route.to
                    ? "bg-[#d96899] text-white shadow-xs"
                    : "border border-pink-200 bg-white text-[#705261] hover:bg-pink-50"
                }`}
              >
                {route.label}
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
              <Plane size={22} />
            </span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Flight Route Search</h2>
              <p className="text-xs text-gray-500">
                Enter 3-letter airport code or city name (e.g. DEL, BOM, DXB, JFK)
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#9a7d8c]">
                From (Origin)
              </span>
              <input
                value={from}
                onChange={(e) => setFrom(e.target.value.toUpperCase())}
                placeholder="e.g. DEL"
                className="w-full rounded-xl border border-pink-100 bg-[#fffafd] p-3.5 text-sm font-bold text-gray-900 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 uppercase"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#9a7d8c]">
                To (Destination)
              </span>
              <input
                value={to}
                onChange={(e) => setTo(e.target.value.toUpperCase())}
                placeholder="e.g. BOM"
                className="w-full rounded-xl border border-pink-100 bg-[#fffafd] p-3.5 text-sm font-bold text-gray-900 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 uppercase"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9a7d8c]">
                <CalendarDays size={14} className="text-[#c65b89]" /> Date
              </span>
              <input
                type="date"
                min={minDate}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-pink-100 bg-[#fffafd] p-3.5 text-sm text-gray-900 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9a7d8c]">
                <Users size={14} className="text-[#c65b89]" /> Passengers
              </span>
              <select
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="w-full rounded-xl border border-pink-100 bg-[#fffafd] p-3.5 text-sm text-gray-900 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              >
                <option value={1}>1 Adult</option>
                <option value={2}>2 Adults</option>
                <option value={3}>3 Adults</option>
                <option value={4}>4+ Passengers</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#9a7d8c]">
                Cabin Class
              </span>
              <select
                value={travelClass}
                onChange={(e) => setTravelClass(e.target.value)}
                className="w-full rounded-xl border border-pink-100 bg-[#fffafd] p-3.5 text-sm text-gray-900 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              >
                <option value="ECONOMY">Economy</option>
                <option value="PREMIUM_ECONOMY">Premium Economy</option>
                <option value="BUSINESS">Business Class</option>
                <option value="FIRST">First Class</option>
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
              disabled={loading || !from.trim() || !to.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#d96899] px-6 py-3.5 font-bold text-white shadow-sm transition hover:bg-[#bd4e80] disabled:opacity-60"
            >
              {loading ? (
                <RefreshCw className="animate-spin" size={17} />
              ) : (
                <Search size={17} />
              )}
              Search Flights
            </button>
          </div>
        </motion.form>
      </section>

      {/* Flight Cards Grid */}
      <section className="mx-auto max-w-7xl px-5 pt-12 sm:px-6">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-black text-gray-900">
              {searched ? `Scheduled Flights: ${from} → ${to}` : "Featured Routes"}
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {flights.length > 0
                ? `Found ${flights.length} active scheduled flights on this corridor`
                : "Search a route above to view available airlines, times, and fares"}
            </p>
          </div>

          {bookingUrl && (
            <a
              href={bookingUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b84f7c] hover:text-[#993460] transition"
            >
              Compare on Google Flights <ExternalLink size={13} />
            </a>
          )}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex items-center justify-center gap-3 rounded-3xl border border-pink-100 bg-white p-12 text-[#9a6480] shadow-sm">
            <RefreshCw className="animate-spin text-[#d96899]" size={24} />
            <span className="font-medium text-base">
              Fetching flight schedules between {from} and {to}...
            </span>
          </div>
        )}

        {/* Results List */}
        {!loading && flights.length > 0 && (
          <div className="space-y-4">
            {flights.map((flight, idx) => (
              <motion.article
                key={flight.id || idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="flex flex-col justify-between gap-6 rounded-3xl border border-pink-100 bg-white p-6 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center"
              >
                {/* Airline & Aircraft */}
                <div className="flex items-center gap-4 sm:w-1/4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-[#d96899] font-bold">
                    <Plane size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{flight.airline}</h3>
                    <p className="text-xs text-gray-500 font-mono">{flight.flightNumber}</p>
                    <p className="text-[10px] text-[#9a7d8c]">{flight.aircraft}</p>
                  </div>
                </div>

                {/* Times & Stops */}
                <div className="flex flex-1 items-center justify-between gap-4 px-2 sm:px-6">
                  <div className="text-left">
                    <p className="text-lg font-black text-gray-900">{flight.departureTime}</p>
                    <p className="text-xs font-bold text-[#b84f7c]">{from}</p>
                  </div>

                  <div className="flex flex-col items-center flex-1 px-4">
                    <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
                      <Clock3 size={11} /> {flight.duration}
                    </span>
                    <div className="my-1.5 flex w-full items-center">
                      <div className="h-0.5 w-full bg-pink-200" />
                      <Plane size={14} className="text-[#d96899] shrink-0 mx-1" />
                      <div className="h-0.5 w-full bg-pink-200" />
                    </div>
                    <span className="rounded-full bg-pink-50 px-2 py-0.5 text-[10px] font-bold text-[#b84f7c]">
                      {flight.stops}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-black text-gray-900">{flight.arrivalTime}</p>
                    <p className="text-xs font-bold text-[#b84f7c]">{to}</p>
                  </div>
                </div>

                {/* Price and CTA */}
                <div className="flex items-center justify-between gap-4 border-t border-pink-50 pt-4 sm:border-0 sm:pt-0 sm:w-1/4 sm:justify-end">
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#9a7d8c]">
                      Est. Fare
                    </p>
                    <p className="text-xl font-black text-[#a84270]">
                      ₹{flight.price.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <a
                    href={flight.bookingUrl || bookingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#d96899] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#bd4e80] transition"
                  >
                    Select <ArrowRight size={13} />
                  </a>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* Empty State before search */}
        {!loading && flights.length === 0 && !searched && (
          <div className="rounded-3xl border border-dashed border-pink-200 bg-white p-12 text-center shadow-xs">
            <Plane size={32} className="mx-auto text-[#c65b89] mb-3" />
            <h3 className="text-lg font-bold text-gray-900">Ready to explore flights?</h3>
            <p className="mt-1 text-sm text-gray-500">
              Select or enter your origin and destination above, then click "Search Flights".
            </p>
            <button
              type="button"
              onClick={() => void handleFlightSearch()}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#d96899] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#bd4e80] transition"
            >
              <Search size={14} /> Search {from} → {to}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
