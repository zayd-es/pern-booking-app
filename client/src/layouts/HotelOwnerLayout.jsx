import { Navigate, Outlet } from "react-router-dom";
import Navbar from "../pages/hotelOwner/_components/Navbar";
import { useUser } from "@clerk/clerk-react";
import SideBar from "../pages/hotelOwner/_components/SideBar";
import { useAppStore } from "../store/useAppStore";

const Layout = () => {
  const { isLoaded, isSignedIn } = useUser();
  const isOwner = useAppStore((state) => state.isOwner);
  const userLoaded = useAppStore((state) => state.userLoaded); // by claude

  // by claude: wait for the role before deciding to redirect (fixes refresh on /owner)
  if (!isLoaded || (isSignedIn && !userLoaded)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isSignedIn || !isOwner) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <SideBar />

        <div className="flex-1 p-4 md:p-10 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
