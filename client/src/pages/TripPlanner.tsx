import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Wallet,
  Users,
  Plane,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

export default function TripPlanner() {
  const [trip, setTrip] = useState({
    destination: "",
    days: "",
    budget: "",
    travelers: "1",
    style: "",
    interests: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setTrip({
      ...trip,
      [e.target.name]: e.target.value,
    });
  };

  const handleGenerate = () => {
    console.log(trip);
    // Connect with Groq later
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50 py-16 px-6">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-6xl"
      >

        <div className="grid gap-12 lg:grid-cols-2 items-center">

          {/* LEFT */}

          <div>

            <div className="inline-flex items-center gap-2 rounded-full bg-pink-100 px-5 py-2 font-semibold text-[#E78FB3]">

              <Sparkles size={18} />

              AI Trip Planner

            </div>

            <h1 className="mt-6 text-6xl font-black leading-tight text-gray-900">

              Plan Your

              <span className="text-[#E78FB3]">

                {" "}Dream Journey

              </span>

            </h1>

            <p className="mt-6 text-lg leading-8 text-gray-600">

              Tell us your destination, budget and travel style.
              Travel Genie AI will generate a complete itinerary,
              hotels, food recommendations, packing list and travel tips.

            </p>

            <img
              src="https://images.unsplash.com/photo-1502920917128-1aa500764ce7?w=1200"
              alt="Travel"
              className="mt-10 rounded-[35px] shadow-2xl"
            />

          </div>

          {/* RIGHT */}

          <motion.div
            whileHover={{ y: -5 }}
            className="rounded-[35px] bg-white p-10 shadow-2xl"
          >

            <h2 className="text-3xl font-bold text-[#E78FB3] mb-8">

              Start Planning

            </h2>

            <div className="space-y-6">

              {/* Destination */}

              <div>

                <label className="font-semibold text-gray-700">

                  Destination

                </label>

                <div className="mt-2 flex items-center rounded-2xl border border-pink-100 px-4 py-4">

                  <MapPin className="mr-3 text-[#E78FB3]" />

                  <input
                    type="text"
                    name="destination"
                    value={trip.destination}
                    onChange={handleChange}
                    placeholder="Goa"
                    className="w-full outline-none"
                  />

                </div>

              </div>

              {/* Days */}

              <div>

                <label className="font-semibold text-gray-700">

                  Number of Days

                </label>

                <div className="mt-2 flex items-center rounded-2xl border border-pink-100 px-4 py-4">

                  <Calendar className="mr-3 text-[#E78FB3]" />

                  <input
                    type="number"
                    name="days"
                    value={trip.days}
                    onChange={handleChange}
                    className="w-full outline-none"
                  />

                </div>

              </div>

              {/* Budget */}

              <div>

                <label className="font-semibold text-gray-700">

                  Budget (₹)

                </label>

                <div className="mt-2 flex items-center rounded-2xl border border-pink-100 px-4 py-4">

                  <Wallet className="mr-3 text-[#E78FB3]" />

                  <input
                    type="number"
                    name="budget"
                    value={trip.budget}
                    onChange={handleChange}
                    className="w-full outline-none"
                  />

                </div>

              </div>

              {/* Travelers */}

              <div>

                <label className="font-semibold text-gray-700">

                  Travelers

                </label>

                <div className="mt-2 flex items-center rounded-2xl border border-pink-100 px-4 py-4">

                  <Users className="mr-3 text-[#E78FB3]" />

                  <select
                    name="travelers"
                    value={trip.travelers}
                    onChange={handleChange}
                    className="w-full bg-transparent outline-none"
                  >
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4+</option>
                  </select>

                </div>

              </div>

              {/* Travel Style */}

              <div>

                <label className="font-semibold text-gray-700">

                  Travel Style

                </label>

                <select
                  name="style"
                  value={trip.style}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-pink-100 px-4 py-4 outline-none"
                >
                  <option value="">Choose Style</option>
                  <option>Luxury</option>
                  <option>Budget</option>
                  <option>Adventure</option>
                  <option>Family</option>
                  <option>Couple</option>
                  <option>Solo</option>
                </select>

              </div>

              {/* Interests */}

              <div>

                <label className="font-semibold text-gray-700">

                  Interests

                </label>

                <input
                  type="text"
                  name="interests"
                  value={trip.interests}
                  onChange={handleChange}
                  placeholder="Beach, Nature, Food..."
                  className="mt-2 w-full rounded-2xl border border-pink-100 px-4 py-4 outline-none"
                />

              </div>

              <button
                onClick={handleGenerate}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E78FB3] py-4 text-lg font-bold text-white transition hover:bg-pink-500"
              >

                <Plane size={20} />

                Generate AI Trip

              </button>

            </div>

          </motion.div>

        </div>

      </motion.div>

    </main>
  );
}