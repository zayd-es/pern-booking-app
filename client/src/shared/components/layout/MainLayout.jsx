import { Outlet } from "react-router-dom";
import { Navbar } from "@/shared/components/layout/Navbar";
import Footer from "@/shared/components/layout/Footer";

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen font-sans antialiased">
      <Navbar />

      <main className="flex-grow">
        <Outlet />
      </main>

      {/* <Footer /> */}
      <Footer />
    </div>
  );
};

export default MainLayout;
