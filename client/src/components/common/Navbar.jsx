// by claude: navbar redesigned (always light and minimal, active links, visible "My Bookings", cleaner mobile menu)
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import Logo from "./Logo"; // by claude
import { Menu, X } from "lucide-react"; // by claude
import { useClerk, useUser, UserButton } from "@clerk/clerk-react";
import { useAppStore } from "../../store/useAppStore";

export const Navbar = () => {
  const { openSignIn } = useClerk();
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const isOwner = useAppStore((state) => state.isOwner);
  const setShowHotelReg = useAppStore((state) => state.setShowHotelReg);

  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 10);

    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Hotels", path: "/rooms" },
    // "Experience" / "About" have no page yet, they stay as placeholders
    { name: "Experience", path: "/", placeholder: true },
    { name: "About", path: "/", placeholder: true },
    ...(user ? [{ name: "My Bookings", path: "/my-bookings" }] : []),
  ];

  const handleOwnerButton = () => {
    setIsMenuOpen(false);
    if (isOwner) navigate("/owner");
    else setShowHotelReg(true);
  };

  const ownerButtonLabel = isOwner ? "Dashboard" : "List Your Hotel";

  return (
    <nav
      className={`fixed top-0 left-0 w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 py-3 bg-white/80 backdrop-blur-lg border-b border-gray-200/70 transition-shadow duration-300 z-50 ${
        hasScrolled ? "shadow-sm" : ""
      }`}
    >
      {/* Logo */}
      <Link to="/">
        <Logo />
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-1">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            end
            className={({ isActive }) =>
              `px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isActive && !link.placeholder
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`
            }
          >
            {link.name}
          </NavLink>
        ))}
      </div>

      {/* Desktop right */}
      <div className="hidden md:flex items-center gap-3">
        {user && (
          <button
            onClick={handleOwnerButton}
            className="border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-800 rounded-full cursor-pointer transition-colors hover:border-gray-900 hover:bg-gray-900 hover:text-white"
          >
            {ownerButtonLabel}
          </button>
        )}

        {user ? (
          <UserButton />
        ) : (
          <button
            onClick={openSignIn}
            className="px-6 py-2 rounded-full text-sm font-medium text-white bg-gray-900 hover:bg-black cursor-pointer transition-colors"
          >
            Login
          </button>
        )}
      </div>

      {/* Mobile top bar */}
      <div className="flex items-center gap-3 md:hidden">
        {user && <UserButton />}
        <Menu
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open menu"
          className="h-6 w-6 cursor-pointer text-gray-800"
        />
      </div>

      {/* Mobile menu */}
      <div
        className={`fixed top-0 left-0 w-full h-screen bg-white text-base flex flex-col md:hidden items-center justify-center gap-5 font-medium text-gray-800 transition-all duration-500 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          className="absolute top-4 right-4 cursor-pointer"
          onClick={() => setIsMenuOpen(false)}
        >
          <X className="h-6 w-6 text-gray-800" />
        </button>

        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            end
            onClick={() => setIsMenuOpen(false)}
            className={({ isActive }) =>
              `px-5 py-1.5 rounded-full transition-all ${
                isActive && !link.placeholder
                  ? "bg-gray-900 text-white"
                  : "text-gray-800"
              }`
            }
          >
            {link.name}
          </NavLink>
        ))}

        {user && (
          <button
            onClick={handleOwnerButton}
            className="border border-gray-900 px-5 py-1.5 text-sm rounded-full cursor-pointer transition-all hover:bg-gray-900 hover:text-white"
          >
            {ownerButtonLabel}
          </button>
        )}

        {!user && (
          <button
            onClick={() => {
              setIsMenuOpen(false);
              openSignIn();
            }}
            className="bg-gray-900 text-white px-8 py-2.5 rounded-full cursor-pointer transition-all"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};
