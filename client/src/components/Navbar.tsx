import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  Sparkles,
  Home,
  Compass,
  LayoutDashboard,
  Hotel,
  Plane,
  CloudSun,
  Heart,
  Bot,
  Settings as SettingsIcon,
  Image,
  Map,
  Store,
  Tag,
  Luggage,
  ChevronDown,
  Globe2,
} from "lucide-react";

// PRIMARY ITEMS: Core focus items directly visible on the desktop navbar
const primaryLinks = [
  { name: "Home", path: "/", icon: Home },
  { name: "Explore", path: "/explore", icon: Compass },
  { name: "Artisans", path: "/artisans", icon: Store, isHighlight: true },
  { name: "Hidden Places", path: "/hidden-places", icon: Map, isHighlight: true },
  { name: "Vision AI", path: "/vision", icon: Image, isHighlight: true },
  { name: "AI Planner", path: "/assistant", icon: Bot },
  { name: "My Trips", path: "/mytrips", icon: Luggage },
];

// SECONDARY ITEMS: Utilities and booking tools in the "More" dropdown
const moreLinks = [
  {
    name: "Hotels",
    path: "/hotels",
    icon: Hotel,
    desc: "Compare & book accommodations",
  },
  {
    name: "Flights",
    path: "/flights",
    icon: Plane,
    desc: "Search global airline routes & fares",
  },
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    desc: "Trip overview, stats & analytics",
  },
  {
    name: "Live Weather",
    path: "/weather",
    icon: CloudSun,
    desc: "Real-time forecast & conditions",
  },
  {
    name: "Special Offers",
    path: "/promotions",
    icon: Tag,
    desc: "Seasonal deals & travel packages",
  },
  {
    name: "Saved Wishlist",
    path: "/wishlist",
    icon: Heart,
    desc: "Your bookmarked dream destinations",
  },
  {
    name: "Visa Guidelines",
    path: "/visa",
    icon: Globe2,
    desc: "Consular entry rules & checklists",
  },
];

// All links for mobile drawer navigation
const allMobileLinks = [
  ...primaryLinks,
  ...moreLinks.map((m) => ({ name: m.name, path: m.path, icon: m.icon })),
  { name: "Settings", path: "/settings", icon: SettingsIcon },
];

export default function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
    setOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const isMoreActive = moreLinks.some((item) => isActive(item.path));

  return (
    <>
      {/* Desktop / Main Navbar */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed left-1/2 top-4 z-50 w-[96%] max-w-[1400px] -translate-x-1/2"
      >
        <div className="flex items-center justify-between rounded-full border border-pink-100 bg-white/95 px-5 py-2.5 shadow-xl shadow-pink-100/40 backdrop-blur-xl">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.02 }} className="shrink-0">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-pink-400 to-pink-300 shadow-md">
                <Sparkles size={20} className="text-white" />
              </div>

              <div className="whitespace-nowrap">
                <h1 className="bg-gradient-to-r from-pink-500 to-pink-400 bg-clip-text text-[19px] font-black leading-none text-transparent">
                  Travel Genie
                </h1>
                <p className="mt-0.5 text-[8.5px] font-bold tracking-[0.18em] text-[#9a7d8c]">
                  AI TRAVEL PLANNER
                </p>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-1 xl:gap-1.5 lg:flex">
            {primaryLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-semibold transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-md shadow-pink-200"
                      : item.isHighlight
                      ? "text-[#4e273d] hover:bg-pink-100/60 hover:text-[#d96899] font-bold"
                      : "text-[#624755] hover:bg-pink-50/80 hover:text-[#d96899]"
                  }`}
                >
                  <Icon size={15} className={item.isHighlight && !active ? "text-[#d96899]" : ""} />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* "More Tools & Booking" Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-semibold transition-all duration-200 ${
                  isMoreActive
                    ? "bg-pink-100 text-[#b84f7c]"
                    : "text-[#624755] hover:bg-pink-50/80 hover:text-[#d96899]"
                }`}
              >
                <span>More</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180 text-[#d96899]" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-3 w-72 rounded-2xl border border-pink-100 bg-white p-2 shadow-2xl shadow-pink-200/50"
                  >
                    <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#b84f7c]">
                      Booking & Travel Utilities
                    </div>
                    <div className="space-y-1">
                      {moreLinks.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setDropdownOpen(false)}
                            className={`flex items-start gap-3 rounded-xl px-3 py-2 text-left transition ${
                              active
                                ? "bg-pink-50 text-[#b84f7c]"
                                : "text-[#533948] hover:bg-pink-50/60"
                            }`}
                          >
                            <div className="mt-0.5 rounded-lg bg-pink-100/70 p-1.5 text-[#c65b89]">
                              <Icon size={15} />
                            </div>
                            <div>
                              <div className="text-xs font-bold">{item.name}</div>
                              <div className="text-[11px] text-[#9a7d8c]">
                                {item.desc}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Action: Settings Quick Link */}
          <div className="hidden items-center gap-2 lg:flex">
            <Link
              to="/settings"
              title="Account Settings"
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                isActive("/settings")
                  ? "bg-pink-500 text-white shadow-sm"
                  : "border border-pink-200 bg-white text-[#7d566c] hover:bg-pink-50 hover:text-[#b84f7c]"
              }`}
            >
              <SettingsIcon size={14} />
              <span>Settings</span>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={open}
            className="rounded-full p-2 text-[#7d566c] hover:bg-pink-50 lg:hidden"
          >
            <Menu size={24} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Background Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
              onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: 350 }}
              animate={{ x: 0 }}
              exit={{ x: 350 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="fixed right-0 top-0 z-50 h-screen w-80 max-w-[85vw] overflow-y-auto bg-white shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-pink-100 p-5">
                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-pink-400 to-pink-300">
                    <Sparkles size={18} className="text-white" />
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-[#d96899]">
                      Travel Genie
                    </h2>
                    <p className="text-[8.5px] font-semibold tracking-wider text-gray-400">
                      AI TRAVEL PLANNER
                    </p>
                  </div>
                </Link>

                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close navigation menu"
                  className="rounded-full p-1.5 text-gray-500 hover:bg-pink-50"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Links List */}
              <div className="p-4 space-y-1">
                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#b84f7c]">
                  Main Navigation
                </div>
                {allMobileLinks.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition ${
                        active
                          ? "bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-sm"
                          : "text-[#533948] hover:bg-pink-50"
                      }`}
                    >
                      <Icon size={18} className={active ? "text-white" : "text-[#c65b89]"} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}