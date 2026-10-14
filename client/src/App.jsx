import { Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import RoomDetails from "./pages/RoomDetails";
import MyBooking from "./pages/MyBooking";
import HotelReg from "./components/common/HotelReg";

import Dashboard from "./pages/hotelOwner/Dashboard";
import AddRoom from "./pages/hotelOwner/AddRoom";
import ListRoom from "./pages/hotelOwner/ListRoom";
import MyHotel from "./pages/hotelOwner/MyHotel"; // by claude
import Layout from "./layouts/HotelOwnerLayout";
import { Toaster } from "react-hot-toast";
import { useAppStore } from "./store/useAppStore";
import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import AllRooms from "./pages/allRooms/AllRooms";
import Loader from "./components/common/Loader";

const App = () => {
  const showHotelReg = useAppStore((state) => state.showHotelReg);
  const fetchRooms = useAppStore((state) => state.fetchRooms);
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const fetchUser = useAppStore((state) => state.fetchUser);
  const resetUser = useAppStore((state) => state.resetUser); // by claude
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);
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
      <Toaster />
      {showHotelReg && <HotelReg />}
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="rooms" element={<AllRooms />} />
          <Route path="rooms/:id" element={<RoomDetails />} />
          <Route path="my-bookings" element={<MyBooking />} />
          <Route path="my-bookings" element={<MyBooking />} />
          <Route path="/loader/:nextUrl" element={<Loader />} />
        </Route>

        <Route path="/owner" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="add-room" element={<AddRoom />} />
          <Route path="list-room" element={<ListRoom />} />
          {/* by claude */}
          <Route path="my-hotel" element={<MyHotel />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
