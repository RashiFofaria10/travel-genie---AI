import { motion } from "framer-motion";
import {
  Bot,
  Map,
  Wallet,
  CloudSun,
  ShieldCheck,
  Clock3,
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI Trip Planner",
    description:
      "Generate personalized travel itineraries in seconds based on your interests, budget, and travel style.",
  },
  {
    icon: Map,
    title: "Smart Itinerary",
    description:
      "Automatically organize your trip day-by-day with attractions, routes, and timings.",
  },
  {
    icon: Wallet,
    title: "Budget Calculator",
    description:
      "Estimate expenses for flights, hotels, food, transport, and activities before you travel.",
  },
  {
    icon: CloudSun,
    title: "Live Weather",
    description:
      "Get weather forecasts and packing suggestions for every destination on your trip.",
  },
  {
    icon: ShieldCheck,
    title: "Safe Travel",
    description:
      "Access travel advisories, visa guidance, emergency contacts, and safety recommendations.",
  },
  {
    icon: Clock3,
    title: "Save Time",
    description:
      "Skip hours of research and let AI plan your perfect vacation within minutes.",
  },
];

export default function Features() {
  return (
    <section className="bg-[#FFF7FA] py-24">
      <div className="mx-auto max-w-7xl px-6">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-[#E78FB3] font-semibold uppercase tracking-[0.3em]">
            Why Choose Travel Genie
          </p>

          <h2 className="mt-4 text-5xl font-bold text-gray-900">
            Smarter Travel Starts Here
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500">
            Everything you need to plan, organize, and enjoy your trip with
            powerful AI assistance.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                whileHover={{
                  y: -8,
                  scale: 1.03,
                }}
                className="rounded-3xl bg-white p-8 shadow-lg transition-all hover:shadow-2xl"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-100">
                  <Icon
                    size={32}
                    className="text-[#E78FB3]"
                  />
                </div>

                <h3 className="mt-6 text-2xl font-bold text-gray-900">
                  {feature.title}
                </h3>

                <p className="mt-4 leading-7 text-gray-500">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}

        </div>
      </div>
    </section>
  );
}