import { Link } from "react-router-dom";
import {
  Sparkles,
  Compass,
  Hotel,
  Plane,
  CloudSun,
  Luggage,
  Bot,
  Image,
  Map,
  Store,
  Tag,
  Settings,
  Heart,
  LayoutDashboard,
  Wallet,
  FileText,
  CheckSquare,
  Globe2,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-pink-100 bg-white/80 backdrop-blur-md pt-14 pb-8 text-[#492b3b]">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-pink-400 to-pink-300 shadow-md">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h2 className="bg-gradient-to-r from-pink-500 to-pink-300 bg-clip-text text-xl font-black text-transparent">
                  Travel Genie AI
                </h2>
                <p className="text-[9px] font-semibold tracking-widest text-[#9a7d8c]">
                  NEXT-GEN TRAVEL INTELLIGENCE
                </p>
              </div>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-[#7a5e6e]">
              Your AI-powered travel planner for discovering authentic local cultures,
              hidden gems, verified artisans, accommodations, and personalized itineraries worldwide.
            </p>

            <div className="mt-6 flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-[#7a5e6e]">
                All Travel Genie Services Operational
              </span>
            </div>
          </div>

          {/* Travel & Booking */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#b84f7c]">
              Travel & Booking
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  to="/explore"
                  className="flex items-center gap-2 text-[#705261] hover:text-[#d96899] transition"
                >
                  <Compass size={15} className="text-pink-400" />
                  Explore Destinations
                </Link>
              </li>
              <li>
                <Link
                  to="/hotels"
                  className="flex items-center gap-2 text-[#705261] hover:text-[#d96899] transition"
                >
                  <Hotel size={15} className="text-pink-400" />
                  Hotel Stays
                </Link>
              </li>
              <li>
                <Link
                  to="/flights"
                  className="flex items-center gap-2 text-[#705261] hover:text-[#d96899] transition"
                >
                  <Plane size={15} className="text-pink-400" />
                  Flight Search
                </Link>
              </li>
              <li>
                <Link
                  to="/weather"
                  className="flex items-center gap-2 text-[#705261] hover:text-[#d96899] transition"
                >
                  <CloudSun size={15} className="text-pink-400" />
                  Live Weather
                </Link>
              </li>
              <li>
                <Link
                  to="/mytrips"
                  className="flex items-center gap-2 text-[#705261] hover:text-[#d96899] transition"
                >
                  <Luggage size={15} className="text-pink-400" />
                  My Trips
                </Link>
              </li>
              <li>
                <Link
                  to="/visa"
                  className="flex items-center gap-2 text-[#705261] hover:text-[#d96899] transition"
                >
                  <Globe2 size={15} className="text-pink-400" />
                  Visa Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* AI & Cultural Tools */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#b84f7c]">
              AI & Culture
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  to="/assistant"
                  className="flex items-center gap-2 text-[#705261] hover:text-[#d96899] transition"
                >
                  <Bot size={15} className="text-pink-400" />
                  AI Travel Assistant
                </Link>
              </li>
              <li>
                <Link
                  to="/vision"
                  className="flex items-center gap-2 text-[#705261] hover:text-[#d96899] transition"
                >
                  <Image size={15} className="text-pink-400" />
                  Vision Photo Scanner
                </Link>
              </li>
              <li>
                <Link
                  to="/hidden-places"
                  className="flex items-center gap-2 text-[#705261] hover:text-[#d96899] transition"
                >
                  <Map size={15} className="text-pink-400" />
                  Hidden Places
                </Link>
              </li>
              <li>
                <Link
                  to="/artisans"
                  className="flex items-center gap-2 text-[#705261] hover:text-[#d96899] transition"
                >
                  <Store size={15} className="text-pink-400" />
                  Local Artisans
                </Link>
              </li>
              <li>
                <Link
                  to="/promotions"
                  className="flex items-center gap-2 text-[#705261] hover:text-[#d96899] transition"
                >
                  <Tag size={15} className="text-pink-400" />
                  Special Offers
                </Link>
              </li>
            </ul>
          </div>

          {/* Account & Planning */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#b84f7c]">
              Account & Utilities
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  to="/settings"
                  className="flex items-center gap-2 font-semibold text-[#b84f7c] hover:text-[#993460] transition"
                >
                  <Settings size={15} className="text-pink-500" />
                  Account Settings
                </Link>
              </li>
              <li>
                <Link
                  to="/wishlist"
                  className="flex items-center gap-2 text-[#705261] hover:text-[#d96899] transition"
                >
                  <Heart size={15} className="text-pink-400" />
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 text-[#705261] hover:text-[#d96899] transition"
                >
                  <LayoutDashboard size={15} className="text-pink-400" />
                  Travel Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/expenses"
                  className="flex items-center gap-2 text-[#705261] hover:text-[#d96899] transition"
                >
                  <Wallet size={15} className="text-pink-400" />
                  Expense Tracker
                </Link>
              </li>
              <li>
                <Link
                  to="/documents"
                  className="flex items-center gap-2 text-[#705261] hover:text-[#d96899] transition"
                >
                  <FileText size={15} className="text-pink-400" />
                  Document Vault
                </Link>
              </li>
              <li>
                <Link
                  to="/packing"
                  className="flex items-center gap-2 text-[#705261] hover:text-[#d96899] transition"
                >
                  <CheckSquare size={15} className="text-pink-400" />
                  Packing Checklist
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-pink-100 pt-6 sm:flex-row text-xs text-[#9a7d8c]">
          <p>© 2026 Travel Genie AI. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link to="/settings" className="hover:text-[#b84f7c] transition font-medium">
              Preferences
            </Link>
            <Link to="/wishlist" className="hover:text-[#b84f7c] transition">
              Wishlist
            </Link>
            <Link to="/assistant" className="hover:text-[#b84f7c] transition">
              Ask AI
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}