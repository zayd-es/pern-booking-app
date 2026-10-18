import { Route, Routes } from "react-router-dom"; // by claude: all routes live here
import MainLayout from "@/shared/components/layout/MainLayout";
import Loader from "@/shared/components/ui/Loader";
import HotelOwnerLayout from "@/features/owner/layouts/HotelOwnerLayout";

import Home from "@/features/home/pages/Home";
import AllRooms from "@/features/rooms/pages/AllRooms";
import RoomDetails from "@/features/rooms/pages/RoomDetails";
import HotelDetails from "@/features/hotels/pages/HotelDetails";
import MyHotel from "@/features/hotels/pages/MyHotel";
import MyBooking from "@/features/bookings/pages/MyBooking";
import Dashboard from "@/features/owner/pages/Dashboard";
import AddRoom from "@/features/owner/pages/AddRoom";
import ListRoom from "@/features/owner/pages/ListRoom";
import About from "@/features/static/pages/About";
import Experiences from "@/features/static/pages/Experiences";
import NotFound from "@/features/static/pages/NotFound";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<MainLayout />}>
      <Route index element={<Home />} />
      <Route path="rooms" element={<AllRooms />} />
      <Route path="rooms/:id" element={<RoomDetails />} />
      <Route path="hotels/:id" element={<HotelDetails />} />
      <Route path="my-bookings" element={<MyBooking />} />
      <Route path="experiences" element={<Experiences />} />
      <Route path="about" element={<About />} />
      <Route path="/loader/:nextUrl" element={<Loader />} />
    </Route>

    <Route path="/owner" element={<HotelOwnerLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="add-room" element={<AddRoom key="add" />} />
      <Route path="edit-room/:id" element={<AddRoom key="edit" />} />
      <Route path="list-room" element={<ListRoom />} />
      <Route path="my-hotel" element={<MyHotel />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
