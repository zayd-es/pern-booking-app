import { Outlet } from "react-router-dom";
import { Navbar } from "../components/common/Navbar";
import Footer from "../components/common/Footer";

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
