import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarDays,
  MapPin,
  Sparkles,
  ArrowRight,
  Search,
  RefreshCw,
  Gift,
} from "lucide-react";
import { getPromotions } from "../services/promotionService";

type Promotion = {
  _id: string;
  title: string;
  description: string;
  destination: string;
  season?: string;
  category?: string;
  image?: string;
  callToAction?: string;
  startDate?: string;
  endDate?: string;
};

const CATEGORIES = [
  "All",
  "Heritage & Culture",
  "Mountain & Adventure",
  "Beach & Relaxation",
  "Wellness & Nature",
  "City & Art",
];

export default function Promotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPromotions = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPromotions();
      setPromotions(data || []);
    } catch (err: any) {
      console.error("Promotions error:", err);
      setError("Failed to load active promotions. Please verify backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPromotions();
  }, []);

  const filteredPromotions = promotions.filter((promo) => {
    const matchesCategory =
      selectedCategory === "All" ||
      (promo.category && promo.category.toLowerCase().includes(selectedCategory.toLowerCase()));

    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      promo.title.toLowerCase().includes(term) ||
      promo.destination.toLowerCase().includes(term) ||
      promo.description.toLowerCase().includes(term);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50/50 via-white to-pink-50/30 px-4 py-10 sm:px-6 md:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white px-3.5 py-1 text-xs font-bold text-[#b84f7c] shadow-xs">
            <Sparkles size={16} />
            Exclusive Seasonal Travel Specials
          </div>

          <h1 className="text-3xl font-black text-gray-900 sm:text-4xl md:text-5xl">
            Special Offers & <span className="text-[#E78FB3]">Promotions</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
            Hand-picked travel campaigns, seasonal discounts, and curated packages
            fetched live from our travel partner network.
          </p>

          {/* Filter Bar */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    selectedCategory === cat
                      ? "bg-[#d96899] text-white shadow-sm"
                      : "border border-pink-100 bg-white text-[#705261] hover:bg-pink-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search size={16} className="absolute left-3.5 top-3 text-[#b07891]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search offers or destination..."
                className="w-full rounded-xl border border-pink-100 bg-white pl-10 pr-4 py-2 text-xs text-gray-900 outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center gap-3 rounded-3xl border border-pink-100 bg-white p-12 text-[#9a6480] shadow-sm">
            <RefreshCw className="animate-spin text-[#d96899]" size={24} />
            <span className="font-medium text-base">Loading current travel promotions...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800">
            {error}
          </div>
        )}

        {/* Grid of Promotions */}
        {!loading && filteredPromotions.length > 0 && (
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {filteredPromotions.map((promotion, index) => (
              <motion.article
                key={promotion._id || index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group flex flex-col overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-100/60"
              >
                <div className="relative h-56 overflow-hidden bg-pink-100">
                  <img
                    src={promotion.image}
                    alt={promotion.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  {promotion.category && (
                    <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#b84f7c] shadow-sm backdrop-blur-xs">
                      {promotion.category}
                    </span>
                  )}

                  {promotion.season && (
                    <span className="absolute right-4 top-4 rounded-full bg-black/50 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-xs">
                      {promotion.season}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h2 className="text-xl font-bold leading-snug text-gray-900">
                    {promotion.title}
                  </h2>

                  <p className="mt-3 flex-1 text-sm leading-6 text-gray-600">
                    {promotion.description}
                  </p>

                  <div className="mt-5 space-y-2 border-t border-pink-50 pt-4 text-xs font-medium text-[#705261]">
                    <div className="flex items-center gap-2">
                      <MapPin size={15} className="text-[#c65b89]" />
                      <span>{promotion.destination}</span>
                    </div>

                    {promotion.startDate && promotion.endDate && (
                      <div className="flex items-center gap-2">
                        <CalendarDays size={15} className="text-[#c65b89]" />
                        <span>
                          Valid until:{" "}
                          {new Date(promotion.endDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/explore`}
                    className="mt-6 inline-flex items-center justify-between rounded-xl bg-pink-50 px-4 py-2.5 text-xs font-bold text-[#b84f7c] transition hover:bg-pink-100"
                  >
                    <span>{promotion.callToAction || "Explore this package"}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPromotions.length === 0 && (
          <div className="rounded-3xl border border-dashed border-pink-200 bg-white px-5 py-12 text-center shadow-xs">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-50 text-[#c65b89]">
              <Gift size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900">No promotions match your filter</h3>
            <p className="mt-1 text-xs text-gray-500">
              Try selecting "All" or searching for a different destination.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}