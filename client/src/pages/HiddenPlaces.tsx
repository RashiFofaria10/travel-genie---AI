import { useState } from "react";
import {
  MapPin,
  Search,
  Sparkles,
  Clock,
  Wallet,
  Navigation,
  Lightbulb,
  Compass,
} from "lucide-react";
import { motion } from "framer-motion";

type HiddenPlace = {
  name: string;
  location: string;
  whyVisit: string;
  whyTouristsMissIt: string;
  bestTime: string;
  timeNeeded: string;
  estimatedCost: string;
  howToReach: string;
  travelTip: string;
};

type HiddenPlacesResponse = {
  destination: string;
  intro: string;
  places: HiddenPlace[];
};

export default function HiddenPlaces() {
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] =
    useState<HiddenPlacesResponse | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!destination.trim() || loading) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "http://localhost:5000/api/hidden-places/discover",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            destination: destination.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to find hidden places."
        );
      }

      // Validate the API response before putting it into state
      if (
        !data.result ||
        !Array.isArray(data.result.places)
      ) {
        console.error(
          "Invalid Hidden Places API response:",
          data
        );

        throw new Error(
          "Travel Genie returned an invalid places response. Please try again."
        );
      }

      setResult({
        destination:
          data.result.destination ||
          destination.trim(),

        intro:
          data.result.intro ||
          "Here are some hidden places worth exploring.",

        places: data.result.places,
      });
    } catch (err) {
      console.error(
        "Hidden Places Error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50 px-6 pb-16 pt-32">

      {/* ================= HERO ================= */}

      <section className="mx-auto max-w-6xl">

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
          }}
          className="text-center"
        >

          {/* Badge */}

          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-pink-100 px-5 py-2 text-sm font-semibold text-[#E78FB3]">
            <Sparkles size={18} />
            Hidden Travel Discovery
          </div>

          {/* Heading */}

          <h1 className="mt-6 text-4xl font-black tracking-tight text-gray-900 md:text-6xl">
            Discover Places

            <span className="block text-[#E78FB3]">
              Tourists Miss
            </span>
          </h1>

          {/* Description */}

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600">
            Tell Travel Genie where you're going and
            discover underrated places, secret spots,
            peaceful escapes, and local experiences
            that don't usually appear on typical
            tourist itineraries.
          </p>

        </motion.div>

        {/* ================= SEARCH ================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.2,
            duration: 0.6,
          }}
          className="mx-auto mt-10 max-w-3xl"
        >

          <div className="rounded-[28px] border border-pink-100 bg-white p-3 shadow-xl">

            <div className="flex flex-col gap-3 sm:flex-row">

              <div className="flex flex-1 items-center gap-3 rounded-2xl bg-pink-50 px-5">

                <MapPin
                  size={22}
                  className="flex-shrink-0 text-[#E78FB3]"
                />

                <input
                  value={destination}
                  onChange={(e) =>
                    setDestination(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  placeholder="Enter a destination, e.g. Manali"
                  className="w-full bg-transparent py-4 text-gray-800 outline-none placeholder:text-gray-400"
                />

              </div>

              <button
                onClick={handleSearch}
                disabled={
                  loading ||
                  !destination.trim()
                }
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#E78FB3] px-7 py-4 font-semibold text-white shadow-lg transition hover:bg-pink-500 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />

                    Discovering...
                  </>
                ) : (
                  <>
                    <Search size={20} />

                    Discover
                  </>
                )}

              </button>

            </div>

          </div>

        </motion.div>

        {/* ================= ERROR ================= */}

        {error && (
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mx-auto mt-6 max-w-3xl rounded-2xl border border-red-100 bg-red-50 p-4 text-center text-red-600"
          >
            ❌ {error}
          </motion.div>
        )}

      </section>

      {/* ================= RESULTS ================= */}

      {result && (
        <section className="mx-auto mt-16 max-w-6xl">

          {/* Result Header */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mb-10"
          >

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100">

                <Compass
                  className="text-[#E78FB3]"
                  size={25}
                />

              </div>

              <div>

                <p className="text-sm font-medium text-gray-500">
                  Hidden discoveries in
                </p>

                <h2 className="text-3xl font-black text-gray-900">
                  {result.destination}
                </h2>

              </div>

            </div>

            {result.intro && (
              <p className="mt-5 max-w-3xl text-gray-600">
                {result.intro}
              </p>
            )}

          </motion.div>

          {/* Places */}

          <div className="grid gap-7 md:grid-cols-2">

            {result.places?.map(
              (place, index) => (
                <motion.article
                  key={`${place.name}-${index}`}
                  initial={{
                    opacity: 0,
                    y: 25,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.08,
                  }}
                  className="overflow-hidden rounded-[30px] border border-pink-100 bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
                >

                  {/* Card Top */}

                  <div className="bg-gradient-to-r from-pink-100 to-pink-50 p-7">

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#E78FB3]">
                          Hidden Spot #{index + 1}
                        </span>

                        <h3 className="mt-4 text-2xl font-black text-gray-900">
                          {place.name}
                        </h3>

                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">

                          <MapPin
                            size={16}
                            className="text-[#E78FB3]"
                          />

                          {place.location}

                        </div>

                      </div>

                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">

                        <MapPin
                          className="text-[#E78FB3]"
                          size={23}
                        />

                      </div>

                    </div>

                  </div>

                  {/* Card Content */}

                  <div className="space-y-6 p-7">

                    {/* Why Visit */}

                    <div>

                      <h4 className="mb-2 flex items-center gap-2 font-bold text-gray-900">

                        <Sparkles
                          size={17}
                          className="text-[#E78FB3]"
                        />

                        Why visit?

                      </h4>

                      <p className="text-sm leading-6 text-gray-600">
                        {place.whyVisit}
                      </p>

                    </div>

                    {/* Why Tourists Miss It */}

                    <div className="rounded-2xl bg-pink-50 p-4">

                      <h4 className="mb-2 flex items-center gap-2 font-bold text-gray-900">

                        <Lightbulb
                          size={17}
                          className="text-[#E78FB3]"
                        />

                        Why tourists miss it

                      </h4>

                      <p className="text-sm leading-6 text-gray-600">
                        {place.whyTouristsMissIt}
                      </p>

                    </div>

                    {/* Details */}

                    <div className="grid grid-cols-2 gap-3">

                      <div className="rounded-2xl border border-pink-100 p-4">

                        <Clock
                          size={18}
                          className="mb-2 text-[#E78FB3]"
                        />

                        <p className="text-xs text-gray-500">
                          Time Needed
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-800">
                          {place.timeNeeded}
                        </p>

                      </div>

                      <div className="rounded-2xl border border-pink-100 p-4">

                        <Wallet
                          size={18}
                          className="mb-2 text-[#E78FB3]"
                        />

                        <p className="text-xs text-gray-500">
                          Estimated Cost
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-800">
                          {place.estimatedCost}
                        </p>

                      </div>

                    </div>

                    {/* Best Time */}

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Best Time
                      </p>

                      <p className="mt-1 text-sm text-gray-700">
                        {place.bestTime}
                      </p>

                    </div>

                    {/* How To Reach */}

                    <div>

                      <h4 className="mb-2 flex items-center gap-2 font-bold text-gray-900">

                        <Navigation
                          size={17}
                          className="text-[#E78FB3]"
                        />

                        How to reach

                      </h4>

                      <p className="text-sm leading-6 text-gray-600">
                        {place.howToReach}
                      </p>

                    </div>

                    {/* Travel Tip */}

                    <div className="border-t border-pink-100 pt-5">

                      <p className="text-sm leading-6 text-gray-600">

                        <span className="font-bold text-[#E78FB3]">
                          💡 Travel Tip:
                        </span>{" "}

                        {place.travelTip}

                      </p>

                    </div>

                  </div>

                </motion.article>
              )
            )}

          </div>

        </section>
      )}

      {/* ================= EMPTY STATE ================= */}

      {!result && !loading && !error && (
        <section className="mx-auto mt-16 max-w-4xl">

          <div className="rounded-[35px] border border-pink-100 bg-white p-10 text-center shadow-lg">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-100">

              <MapPin
                size={28}
                className="text-[#E78FB3]"
              />

            </div>

            <h2 className="mt-5 text-2xl font-black text-gray-900">
              Your next hidden gem is waiting
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-gray-500">
              Search any destination and let Travel
              Genie uncover places beyond the usual
              tourist checklist.
            </p>

          </div>

        </section>
      )}

    </main>
  );
}