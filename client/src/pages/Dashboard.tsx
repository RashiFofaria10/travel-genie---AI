import { motion } from "framer-motion";
import {
  Plane,
  Hotel,
  CloudSun,
  Heart,
  MapPinned,
  Wallet,
  CalendarDays,
  ArrowRight,
  Compass,
  Luggage,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api/trips";
const WISHLIST_KEY = "travel-genie-wishlist";

type Trip = {
  _id?: string;
  id?: string | number;
  destination?: string;
  title?: string;
  startDate?: string;
  endDate?: string;
  date?: string;
  departureDate?: string;
  status?: string;
  budget?: number | string;
  estimatedBudget?: number | string;
};

type DashboardStats = {
  trips: Trip[];
  wishlistCount: number;
  budget: number;
};

function getDestination(trip: Trip) {
  return trip.destination || trip.title || "Untitled trip";
}

function getTripDate(trip: Trip) {
  return trip.startDate || trip.departureDate || trip.date || "";
}

function formatDate(value: string) {
  if (!value) return "Date not added";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getBudget(trip: Trip) {
  const value = Number(trip.budget ?? trip.estimatedBudget ?? 0);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getWishlistCount() {
  try {
    const saved = localStorage.getItem(WISHLIST_KEY);
    if (!saved) return 0;

    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

const quickLinks = [
  {
    title: "Flights",
    description: "Search flight options",
    icon: Plane,
    to: "/flights",
  },
  {
    title: "Hotels",
    description: "Explore accommodation",
    icon: Hotel,
    to: "/hotels",
  },
  {
    title: "Weather",
    description: "Check your destination",
    icon: CloudSun,
    to: "/weather",
  },
  {
    title: "Wishlist",
    description: "Your saved places",
    icon: Heart,
    to: "/wishlist",
  },
];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    trips: [],
    wishlistCount: 0,
    budget: 0,
  });

  const [lastUpdated, setLastUpdated] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Could not load your trips.");
      }

      const trips: Trip[] = Array.isArray(data.trips) ? data.trips : [];

      setStats({
        trips,
        wishlistCount: getWishlistCount(),
        budget: trips.reduce((total, trip) => total + getBudget(trip), 0),
      });

      setLastUpdated(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    } catch (err) {
      setStats((current) => ({
        ...current,
        wishlistCount: getWishlistCount(),
      }));

      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the Travel Genie server."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();

    const handleStorage = () => void loadDashboard();
    const handleFocus = () => void loadDashboard();

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadDashboard]);

  const cards = [
    {
      title: "My Trips",
      value: String(stats.trips.length),
      note: "Trips saved in your database",
      icon: Plane,
    },
    {
      title: "Wishlist",
      value: String(stats.wishlistCount),
      note: "Saved places",
      icon: Heart,
    },
    {
      title: "Planned Budget",
      value: formatCurrency(stats.budget),
      note: "Total budget of saved trips",
      icon: Wallet,
    },
    {
      title: "Travel Tools",
      value: "4",
      note: "Quick links available",
      icon: Compass,
    },
  ];

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const upcomingTrips = [...stats.trips]
    .filter((trip) => {
      const date = getTripDate(trip);
      if (!date) return true;

      const parsed = new Date(date);
      return Number.isNaN(parsed.getTime()) || parsed >= todayStart;
    })
    .sort((a, b) => {
      const dateA = getTripDate(a);
      const dateB = getTripDate(b);

      if (!dateA) return 1;
      if (!dateB) return -1;

      return new Date(dateA).getTime() - new Date(dateB).getTime();
    })
    .slice(0, 4);

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50">
      <section className="mx-auto max-w-7xl px-5 pt-12 sm:px-6 lg:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#D875A0]">
              Your travel space
            </p>

            <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
              Welcome Back,
              <span className="text-[#E78FB3]"> Traveler!</span>
            </h1>

            <p className="mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
              Your next adventure starts here. Keep your trips, saved places,
              and travel tools in one place.
            </p>
          </div>

          <button
            onClick={() => void loadDashboard()}
            disabled={loading}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-pink-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-pink-50 disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh dashboard
          </button>
        </motion.div>

        <p className="mt-4 text-xs text-gray-500">
          {lastUpdated
            ? `Updated at ${lastUpdated}`
            : "Loading your travel data…"}
        </p>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error} Make sure your backend is running.
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -5 }}
                className="rounded-3xl border border-pink-100/80 bg-white p-6 shadow-[0_12px_35px_rgba(231,143,179,0.10)] sm:p-7"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-2xl bg-pink-50 p-3">
                    <Icon size={25} className="text-[#E78FB3]" />
                  </span>
                  <span className="h-2 w-2 rounded-full bg-[#E78FB3]" />
                </div>

                <h2 className="mt-6 break-words text-3xl font-black text-gray-900">
                  {loading ? "…" : card.value}
                </h2>

                <p className="mt-2 font-semibold text-gray-700">
                  {card.title}
                </p>

                <p className="mt-1 text-sm text-gray-500">{card.note}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-6">
        <div className="grid items-start gap-7 lg:grid-cols-2">
          <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-[0_12px_35px_rgba(231,143,179,0.10)] sm:p-8">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-pink-50 p-3">
                <CalendarDays className="text-[#E78FB3]" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  Upcoming Trips
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Your saved travel plans
                </p>
              </div>
            </div>

            {loading ? (
              <p className="mt-8 text-gray-500">Loading trips…</p>
            ) : upcomingTrips.length > 0 ? (
              <div className="mt-7 space-y-4">
                {upcomingTrips.map((trip, index) => (
                  <motion.div
                    key={trip._id ?? trip.id ?? `${getDestination(trip)}-${index}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col gap-3 rounded-2xl border border-pink-100 bg-pink-50/40 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="rounded-xl bg-white p-3 shadow-sm">
                        <Plane size={20} className="text-[#E78FB3]" />
                      </span>
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {getDestination(trip)}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {formatDate(getTripDate(trip))}
                        </p>
                      </div>
                    </div>

                    <span className="w-fit rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#C85F91]">
                      {trip.status || "Planned"}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="mt-7 rounded-2xl border border-dashed border-pink-200 px-5 py-8 text-center">
                <Luggage size={34} className="mx-auto text-[#E78FB3]" />
                <h3 className="mt-4 font-bold text-gray-900">
                  Your next adventure is waiting
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                  You haven't saved any trips here yet. Create a trip and save
                  it to see it on your dashboard.
                </p>
                <Link
                  to="/mytrips"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#E78FB3] px-5 py-3 font-semibold text-white transition hover:bg-pink-500"
                >
                  View My Trips <ArrowRight size={17} />
                </Link>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-[0_12px_35px_rgba(231,143,179,0.10)] sm:p-8">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-pink-50 p-3">
                <MapPinned className="text-[#E78FB3]" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  Quick Access
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Jump into your travel tools
                </p>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {quickLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.title}
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      to={item.to}
                      className="group flex h-full items-center gap-4 rounded-2xl border border-pink-100 bg-pink-50/60 p-4 transition hover:border-pink-200 hover:bg-pink-100/70"
                    >
                      <span className="rounded-xl bg-white p-3 shadow-sm">
                        <Icon size={22} className="text-[#E78FB3]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold text-gray-900">
                          {item.title}
                        </span>
                        <span className="mt-1 block text-xs text-gray-500">
                          {item.description}
                        </span>
                      </span>
                      <ArrowRight
                        size={17}
                        className="shrink-0 text-[#E78FB3] transition group-hover:translate-x-1"
                      />
                    </Link>
                    </motion.div>
                );
              })}
            </div>

            <Link
              to="/explore"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E78FB3] py-4 font-bold text-white transition hover:bg-pink-500"
            >
              Explore Destinations <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-gray-500">
          Dashboard figures use trips from your backend and saved places from
          your browser's wishlist.
        </p>
      </section>
    </main>
  );
}
