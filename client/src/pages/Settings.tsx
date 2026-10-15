import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Globe,
  Bell,
  DollarSign,
  Languages,
  Shield,
  Save,
  CheckCircle2,
  Download,
  RotateCcw,
  Sparkles,
  MapPin,
  Compass,
} from "lucide-react";

const SETTINGS_STORAGE_KEY = "travel-genie-user-settings";

export type UserSettings = {
  fullName: string;
  email: string;
  phone: string;
  homeCity: string;
  bio: string;
  language: string;
  currency: string;
  travelStyle: string;
  dietaryPreference: string;
  flightAlerts: boolean;
  hotelDeals: boolean;
  weatherUpdates: boolean;
  artisanAlerts: boolean;
};

const defaultSettings: UserSettings = {
  fullName: "Dr. Dhaval",
  email: "dhaval@travelgenie.ai",
  phone: "+91 98765 43210",
  homeCity: "Ahmedabad, India",
  bio: "Passionate traveler exploring authentic cultural crafts, heritage trails, and local artisan communities.",
  language: "English",
  currency: "INR (₹)",
  travelStyle: "Cultural & Heritage",
  dietaryPreference: "Vegetarian",
  flightAlerts: true,
  hotelDeals: true,
  weatherUpdates: true,
  artisanAlerts: true,
};

export default function Settings() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load saved settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.warn("Could not load user settings:", e);
    }
  }, []);

  const handleChange = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaveSuccess(false);
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset your preferences to default?")) {
      setSettings(defaultSettings);
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleExportData = () => {
    const dataToExport = {
      userSettings: settings,
      wishlist: localStorage.getItem("travel-genie-wishlist"),
      expenses: localStorage.getItem("travel-genie-expenses"),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `travel-genie-settings-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Avatar initials
  const initials = settings.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "TG";

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50/60 via-white to-pink-50/40 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <section className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
          >
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white px-3.5 py-1 text-xs font-semibold text-[#b84f7c] shadow-xs">
                <Sparkles size={14} />
                User Preferences & Profile
              </div>
              <h1 className="text-3xl font-black text-gray-900 sm:text-4xl">
                Account <span className="text-[#E78FB3]">Settings</span>
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Personalize your currency, travel styles, notifications, and profile details.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportData}
                className="inline-flex items-center gap-1.5 rounded-xl border border-pink-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#7d566c] shadow-xs hover:bg-pink-50 transition"
              >
                <Download size={14} />
                Export Data
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-600 shadow-xs hover:bg-gray-50 transition"
              >
                <RotateCcw size={14} />
                Reset
              </button>
            </div>
          </motion.div>
        </section>

        {/* Profile Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col items-center gap-5 rounded-3xl border border-pink-100 bg-white p-6 shadow-sm sm:flex-row sm:justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-[#d96899] text-xl font-bold text-white shadow-md">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{settings.fullName}</h2>
              <p className="text-xs text-gray-500">{settings.email}</p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-pink-50 px-2.5 py-0.5 text-xs font-medium text-[#b84f7c]">
                  <MapPin size={11} /> {settings.homeCity}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  <Compass size={11} /> {settings.travelStyle}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <span className="rounded-xl bg-pink-50/80 px-3 py-1.5 text-xs font-bold text-[#b84f7c]">
              Currency: {settings.currency}
            </span>
            <span className="rounded-xl bg-pink-50/80 px-3 py-1.5 text-xs font-bold text-[#b84f7c]">
              Language: {settings.language}
            </span>
          </div>
        </motion.div>

        {/* Save Banner Toast */}
        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 shadow-sm"
            >
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Settings Saved Successfully!</p>
                <p className="text-xs text-emerald-700">
                  Your travel preferences, currency, and profile information have been updated.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Settings Form */}
        <form onSubmit={handleSave}>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* 1. Profile Details */}
            <motion.div
              whileHover={{ y: -2 }}
              className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm sm:p-7"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-pink-50 p-3 text-[#d96899]">
                  <User size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Personal Profile</h2>
                  <p className="text-xs text-gray-500">Your public traveler identification</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#9a7d8c]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={settings.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    placeholder="e.g. Dr. Dhaval"
                    className="w-full rounded-xl border border-pink-100 bg-[#fffafd] px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#9a7d8c]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="e.g. user@example.com"
                    className="w-full rounded-xl border border-pink-100 bg-[#fffafd] px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#9a7d8c]">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={settings.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="+91 ..."
                      className="w-full rounded-xl border border-pink-100 bg-[#fffafd] px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#9a7d8c]">
                      Home City
                    </label>
                    <input
                      type="text"
                      value={settings.homeCity}
                      onChange={(e) => handleChange("homeCity", e.target.value)}
                      placeholder="e.g. Ahmedabad, India"
                      className="w-full rounded-xl border border-pink-100 bg-[#fffafd] px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#9a7d8c]">
                    Traveler Bio
                  </label>
                  <textarea
                    rows={2}
                    value={settings.bio}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    placeholder="Brief note on your travel interests..."
                    className="w-full rounded-xl border border-pink-100 bg-[#fffafd] px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                  />
                </div>
              </div>
            </motion.div>

            {/* 2. Travel Preferences */}
            <motion.div
              whileHover={{ y: -2 }}
              className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm sm:p-7"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-pink-50 p-3 text-[#d96899]">
                  <Globe size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Travel Preferences</h2>
                  <p className="text-xs text-gray-500">Customize how prices and info appear</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9a7d8c]">
                      <DollarSign size={14} /> Currency
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) => handleChange("currency", e.target.value)}
                      className="w-full rounded-xl border border-pink-100 bg-[#fffafd] px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                    >
                      <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                      <option value="USD ($)">USD ($) - US Dollar</option>
                      <option value="EUR (€)">EUR (€) - Euro</option>
                      <option value="GBP (£)">GBP (£) - British Pound</option>
                      <option value="JPY (¥)">JPY (¥) - Japanese Yen</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9a7d8c]">
                      <Languages size={14} /> Language
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) => handleChange("language", e.target.value)}
                      className="w-full rounded-xl border border-pink-100 bg-[#fffafd] px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">हिन्दी (Hindi)</option>
                      <option value="Gujarati">ગુજરાતી (Gujarati)</option>
                      <option value="French">Français (French)</option>
                      <option value="Spanish">Español (Spanish)</option>
                      <option value="Japanese">日本語 (Japanese)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#9a7d8c]">
                    Primary Travel Style
                  </label>
                  <select
                    value={settings.travelStyle}
                    onChange={(e) => handleChange("travelStyle", e.target.value)}
                    className="w-full rounded-xl border border-pink-100 bg-[#fffafd] px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                  >
                    <option value="Cultural & Heritage">Cultural & Heritage (Artisans, History, Guilds)</option>
                    <option value="Balanced & Explorer">Balanced & Explorer (Sights, Food, Comfort)</option>
                    <option value="Budget & Backpacker">Budget & Backpacker (Affordable Stays & Travel)</option>
                    <option value="Luxury & Relaxation">Luxury & Relaxation (Resorts, Fine Dining)</option>
                    <option value="Adventure & Nature">Adventure & Nature (Trekking, Wildlife)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#9a7d8c]">
                    Dietary Preference
                  </label>
                  <select
                    value={settings.dietaryPreference}
                    onChange={(e) => handleChange("dietaryPreference", e.target.value)}
                    className="w-full rounded-xl border border-pink-100 bg-[#fffafd] px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                  >
                    <option value="No Preference">No Preference</option>
                    <option value="Vegetarian">Pure Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Jain">Jain Vegetarian</option>
                    <option value="Halal">Halal</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* 3. Notifications */}
            <motion.div
              whileHover={{ y: -2 }}
              className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm sm:p-7"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-pink-50 p-3 text-[#d96899]">
                  <Bell size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                  <p className="text-xs text-gray-500">Manage alerts and travel updates</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <label className="flex items-center justify-between rounded-2xl border border-pink-100 p-4 transition hover:bg-pink-50/40 cursor-pointer">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Flight Status & Price Alerts</p>
                    <p className="text-xs text-gray-500">Real-time alerts on flight routes and schedule changes</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.flightAlerts}
                    onChange={(e) => handleChange("flightAlerts", e.target.checked)}
                    className="h-5 w-5 accent-[#d96899] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between rounded-2xl border border-pink-100 p-4 transition hover:bg-pink-50/40 cursor-pointer">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Hotel Deals & Price Drops</p>
                    <p className="text-xs text-gray-500">Special seasonal discounts for your wishlist places</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.hotelDeals}
                    onChange={(e) => handleChange("hotelDeals", e.target.checked)}
                    className="h-5 w-5 accent-[#d96899] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between rounded-2xl border border-pink-100 p-4 transition hover:bg-pink-50/40 cursor-pointer">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Live Weather Advisory</p>
                    <p className="text-xs text-gray-500">Forecast and precipitation warnings before your trip</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.weatherUpdates}
                    onChange={(e) => handleChange("weatherUpdates", e.target.checked)}
                    className="h-5 w-5 accent-[#d96899] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between rounded-2xl border border-pink-100 p-4 transition hover:bg-pink-50/40 cursor-pointer">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Artisan & Heritage Showcase</p>
                    <p className="text-xs text-gray-500">Updates on local workshops and handmade crafts</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.artisanAlerts}
                    onChange={(e) => handleChange("artisanAlerts", e.target.checked)}
                    className="h-5 w-5 accent-[#d96899] cursor-pointer"
                  />
                </label>
              </div>
            </motion.div>

            {/* 4. Privacy & Security */}
            <motion.div
              whileHover={{ y: -2 }}
              className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm sm:p-7"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-pink-50 p-3 text-[#d96899]">
                  <Shield size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Security & Data Vault</h2>
                  <p className="text-xs text-gray-500">Local privacy and storage controls</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-pink-100 p-4 bg-[#fffafd]">
                  <p className="text-sm font-semibold text-gray-900">Local Privacy First</p>
                  <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                    Your preferences, documents in IndexedDB, and wishlists are stored securely in your browser and synced directly with your private MongoDB instance.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => alert("Password update verification link has been sent to your email address: " + settings.email)}
                  className="w-full rounded-2xl border border-pink-200 p-3.5 text-xs font-bold text-[#b84f7c] hover:bg-pink-50 transition"
                >
                  Change Password / Security Key
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Clear all temporary travel caches? Your saved trips will remain safe.")) {
                      localStorage.removeItem("travel-genie-cache");
                      alert("Cache cleared successfully!");
                    }
                  }}
                  className="w-full rounded-2xl border border-gray-200 p-3.5 text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
                >
                  Clear Temporary Search Cache
                </button>
              </div>
            </motion.div>
          </div>

          {/* Bottom Save Bar */}
          <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-3xl border border-pink-100 bg-white p-5 shadow-sm sm:flex-row sm:p-6">
            <p className="text-xs text-[#9a7d8c]">
              All changes are automatically persisted to your Travel Genie profile.
            </p>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-[#d96899] px-8 py-3.5 font-bold text-white shadow-md shadow-pink-200 transition hover:from-pink-600 hover:to-[#c65b89]"
            >
              <Save size={18} />
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}