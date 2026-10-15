import PageLayout from "../components/PageLayout";
import TripHero from "../components/TripHero";
import BudgetCards from "../components/BudgetCards";
import ItineraryTimeline from "../components/ItineraryTimeline";
import HotelCards from "../components/HotelCards";
import PackingCards from "../components/PackingCards";
import FoodCards from "../components/FoodCards";

import { motion } from "framer-motion";
import { useState } from "react";
import { chatWithAI } from "../services/chatService";
import {
  Sparkles,
  MapPin,
  Plane,
  Globe,
  ArrowRight,
} from "lucide-react";

import Destinations from "./Destinations";

export default function Landing() {
  const [destination, setDestination] = useState("");
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const quickDestinations = [
    "Bali",
    "Japan",
    "Switzerland",
    "Dubai",
    "Maldives",
  ];
  const handlePlanTrip = async () => {
    if (!destination.trim()) {
      alert("Please enter a destination");
      return;
    }

    try {
      setLoading(true);

      const result = await chatWithAI(destination);

      setTrip(JSON.parse(result));

    } catch (error) {
      console.error(error);

      setTrip(null);
      alert("Unable to generate trip.");

    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>

      {/* Hero Section */}

      <section className="mx-auto max-w-7xl px-6 pt-20 pb-24">

        <div className="grid items-center gap-14 lg:grid-cols-2">

          {/* Left */}

          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >

            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-pink-100 px-4 py-2 font-medium text-[#E78FB3]">

              <Sparkles size={18} />

              AI Powered Travel Planner

            </div>

            <h1 className="text-5xl font-black leading-tight text-gray-900 lg:text-7xl">

              Your Personal

              <span className="text-[#E78FB3]">

                {" "}Travel Genie

              </span>

            </h1>

            <p className="mt-8 text-lg leading-8 text-gray-600">

              Plan your perfect trip in seconds.
              Discover destinations, calculate budgets,
              build itineraries, check weather,
              packing lists and much more —
              all powered by AI.

            </p>

            {/* Search */}

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">

              <div className="flex-1">

                <div className="flex items-center rounded-2xl border bg-white px-4 py-4 shadow-lg">

                  <MapPin className="mr-3 text-[#E78FB3]" />

                  <input
                    type="text"
                    placeholder="Where do you want to go?"
                    className="w-full outline-none"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />

                </div>

              </div>

              <button
                onClick={handlePlanTrip}
                className="rounded-2xl bg-[#E78FB3] px-8 py-4 font-semibold text-white transition hover:bg-pink-500"
              >
                {loading ? "Planning..." : "Plan Trip"}
              </button>

            </div>

            {/* Quick Destinations */}

            <div className="mt-8 flex flex-wrap gap-3">

              {quickDestinations.map((city) => (

                <button
                  key={city}
                  onClick={() => setDestination(city)}
                  className="rounded-full border bg-white px-5 py-2 transition hover:bg-pink-50"
                >
                  {city}
                </button>

              ))}

            </div>

          </motion.div>

          {/* Right */}

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >

            <div className="rounded-[40px] bg-white p-10 shadow-2xl">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-gray-500">

                    AI Recommendation

                  </p>

                  <h2 className="mt-2 text-3xl font-bold">

                    Switzerland

                  </h2>

                </div>

                <Plane
                  size={42}
                  className="text-[#E78FB3]"
                />

              </div>

              <img
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=900"
                alt="Switzerland"
                className="mt-8 h-72 w-full rounded-3xl object-cover"
              />

              <div className="mt-8 grid grid-cols-3 gap-5">

                <div className="rounded-2xl bg-pink-50 p-5 text-center">

                  <Globe
                    className="mx-auto text-[#E78FB3]"
                  />

                  <h3 className="mt-3 text-2xl font-bold">

                    120

                    +

                  </h3>

                  <p className="text-sm text-gray-500">

                    Countries

                  </p>

                </div>

                <div className="rounded-2xl bg-pink-50 p-5 text-center">

                  <Plane
                    className="mx-auto text-[#E78FB3]"
                  />

                  <h3 className="mt-3 text-2xl font-bold">

                    25000

                    +

                  </h3>

                  <p className="text-sm text-gray-500">

                    Trips

                  </p>

                </div>

                <div className="rounded-2xl bg-pink-50 p-5 text-center">

                  <ArrowRight
                    className="mx-auto text-[#E78FB3]"
                  />

                  <h3 className="mt-3 text-2xl font-bold">

                    98

                    %

                  </h3>

                  <p className="text-sm text-gray-500">

                    Satisfaction

                  </p>

                </div>

              </div>

            </div>

          </motion.div>

        </div>

      </section>

      <Destinations />

      {trip && (
        <section className="mx-auto max-w-7xl px-6 pb-20">

          <div className="rounded-3xl bg-white p-8 shadow-xl mt-10">

            <h2 className="text-3xl font-bold text-[#E78FB3] mb-6">
              ✨ Your AI Travel Plan
            </h2>

            <div className="space-y-10">


              <TripHero trip={trip} />

              <BudgetCards budget={trip.budget} />

              <ItineraryTimeline itinerary={trip.itinerary} />

              <HotelCards hotels={trip.hotels} />

              <FoodCards foods={trip.foods} />

              <PackingCards packing={trip.packing} />

            </div>          </div>

        </section>
      )}

    </PageLayout>
  );
}