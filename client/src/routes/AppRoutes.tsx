
import Artisans from "../pages/Artisans";
import Promotions from "../pages/Promotions";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/layout/Footer";

import Landing from "../pages/Landing";
import Dashboard from "../pages/Dashboard";
import Explore from "../pages/Explore";
import Hotels from "../pages/Hotels";
import Flights from "../pages/Flights";
import Weather from "../pages/Weather";
import Packing from "../pages/Packing";
import Wishlist from "../pages/Wishlist";
import Visa from "../pages/Visa";
import Expenses from "../pages/Expenses";
import Documents from "../pages/Documents";
import MyTrips from "../pages/MyTrips";
import Assistant from "../pages/Assistant";
import Vision from "../pages/Vision";
import HiddenPlaces from "../pages/HiddenPlaces";
import Settings from "../pages/Settings";
import NotFound from "../pages/NotFound";

function AppRoutes() {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  const isAssistantPage = location.pathname === "/assistant";

  return (
    <>
      <Navbar />

      <main
        className={
          isLandingPage
            ? ""
            : isAssistantPage
            ? "pt-20 h-screen overflow-hidden"
            : "pt-28 sm:pt-32"
        }
      >
        <Routes>
          {/* Home */}
          <Route path="/" element={<Landing />} />

          {/* Main Features */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/flights" element={<Flights />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/packing" element={<Packing />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/visa" element={<Visa />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/mytrips" element={<MyTrips />} />

          {/* AI Assistant */}
          <Route path="/assistant" element={<Assistant />} />

          {/* AI Photo Search */}
          <Route path="/vision" element={<Vision />} />

          {/* Hidden Places Recommendation */}
          <Route path="/hidden-places" element={<HiddenPlaces />} />

          {/* Local Artisans */}
          <Route path="/artisans" element={<Artisans />} />

          {/* Smart Travel Promotions */}
          <Route path="/promotions" element={<Promotions />} />

          {/* Settings */}
          <Route path="/settings" element={<Settings />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!isAssistantPage && <Footer />}
    </>
  );
}

export default AppRoutes;
