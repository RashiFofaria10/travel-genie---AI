import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Globe,
  FileText,
  Clock3,
  Sparkles,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { VISA_DATA } from "../services/visaService";

const CATEGORIES = ["All", "Visa Free", "eVisa", "Visa on Arrival", "Embassy Visa"];

export default function Visa() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>("japan");

  const filteredVisas = VISA_DATA.filter((visa) => {
    const matchesCategory =
      category === "All" || visa.category.toLowerCase() === category.toLowerCase();

    const term = query.trim().toLowerCase();
    const matchesQuery =
      !term ||
      visa.country.toLowerCase().includes(term) ||
      visa.category.toLowerCase().includes(term) ||
      visa.notes?.toLowerCase().includes(term);

    return matchesCategory && matchesQuery;
  });

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
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
            Global Immigration & Entry Regulations
          </div>

          <h1 className="text-3xl font-black text-gray-900 sm:text-4xl lg:text-5xl">
            Visa Requirements & <span className="text-[#E78FB3]">Guidelines</span>
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
            Verified consular entry rules, fees, processing windows, and document checklists
            for worldwide travel destinations.
          </p>

          {/* Search & Filter Bar */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    category === cat
                      ? "bg-[#d96899] text-white shadow-xs"
                      : "border border-pink-100 bg-white text-[#705261] hover:bg-pink-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[260px]">
              <Search size={16} className="absolute left-3.5 top-3 text-[#b07891]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search country or requirement..."
                className="w-full rounded-xl border border-pink-100 bg-white pl-10 pr-4 py-2.5 text-xs text-gray-900 outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 shadow-xs"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Visa Cards List */}
      <section className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="space-y-4">
          {filteredVisas.map((visa, index) => {
            const isExpanded = expandedId === visa.id;

            return (
              <motion.article
                key={visa.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="overflow-hidden rounded-3xl border border-pink-100 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                {/* Main Card Header */}
                <div
                  onClick={() => toggleExpand(visa.id)}
                  className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-3xl">{visa.flag}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-gray-900">{visa.country}</h2>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            visa.category === "Visa Free"
                              ? "bg-emerald-100 text-emerald-800"
                              : visa.category === "eVisa"
                              ? "bg-blue-100 text-blue-800"
                              : visa.category === "Visa on Arrival"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {visa.category}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Stay: <span className="font-semibold text-gray-700">{visa.stayDuration}</span> · Validity:{" "}
                        <span className="font-semibold text-gray-700">{visa.validity}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-6 sm:justify-end">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] uppercase font-bold text-[#9a7d8c]">Government Fee</p>
                      <p className="text-sm font-black text-[#a84270]">{visa.fee}</p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-[10px] uppercase font-bold text-[#9a7d8c]">Processing</p>
                      <p className="text-xs font-semibold text-gray-700 flex items-center gap-1 sm:justify-end">
                        <Clock3 size={12} className="text-[#d96899]" />
                        {visa.processingTime}
                      </p>
                    </div>

                    <button
                      type="button"
                      aria-label="Toggle details"
                      className="rounded-full p-1.5 text-gray-400 hover:bg-pink-50 hover:text-gray-700 transition"
                    >
                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-200 ${
                          isExpanded ? "rotate-180 text-[#d96899]" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-pink-50 mt-5 pt-5 space-y-4"
                    >
                      {visa.notes && (
                        <div className="rounded-2xl bg-pink-50/60 p-4 text-xs leading-relaxed text-[#743555]">
                          <span className="font-bold">Key Travel Advisory: </span>
                          {visa.notes}
                        </div>
                      )}

                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#9a7d8c] mb-2.5 flex items-center gap-1.5">
                          <FileText size={14} className="text-[#c65b89]" /> Mandatory Document Checklist
                        </h4>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {visa.documents.map((doc, docIdx) => (
                            <div
                              key={docIdx}
                              className="flex items-start gap-2 rounded-xl bg-[#fff8fb] p-2.5 text-xs text-gray-700 border border-pink-50"
                            >
                              <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                              <span>{doc}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {visa.officialPortalUrl && (
                        <div className="pt-2 flex justify-end">
                          <a
                            href={visa.officialPortalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#d96899] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#bd4e80] transition"
                          >
                            Official Government Portal <ExternalLink size={12} />
                          </a>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </div>

        {filteredVisas.length === 0 && (
          <div className="rounded-3xl border border-dashed border-pink-200 bg-white p-12 text-center shadow-xs">
            <Globe size={32} className="mx-auto text-[#c65b89] mb-3" />
            <h3 className="text-base font-bold text-gray-900">No destination matched your search</h3>
            <p className="mt-1 text-xs text-gray-500">
              Try searching for Japan, Dubai, France, Thailand, Singapore, or Vietnam.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}