import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useAppStore } from "@/store/useAppStore";
import HotelReg from "@/features/hotels/components/HotelReg";
import AppRoutes from "@/app/router"; // by claude: routes moved to app/router.jsx

// by claude: always start a new page at the top
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => {
  const showHotelReg = useAppStore((state) => state.showHotelReg);
  const fetchHotels = useAppStore((state) => state.fetchHotels);
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const fetchUser = useAppStore((state) => state.fetchUser);
  const resetUser = useAppStore((state) => state.resetUser); // by claude
  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);
  useEffect(() => {
    if (isLoaded && user) {
      fetchUser(getToken);
    }
    // by claude: logged out -> forget the owner role
    if (isLoaded && !user) {
      resetUser();
    }
  }, [isLoaded, user, getToken, fetchUser, resetUser]);
  return (
    <div>
      <ScrollToTop />
      <Toaster toastOptions={{ style: { background: "var(--color-white)", color: "var(--color-gray-900)", border: "1px solid var(--color-gray-200)" } }} /> {/* by claude: follows dark mode */}
      {showHotelReg && <HotelReg />}
      <AppRoutes />
    </div>
  );
};

export default App;
