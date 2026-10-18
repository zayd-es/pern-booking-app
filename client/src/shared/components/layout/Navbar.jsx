// by claude: navbar redesigned (always light and minimal, active links, visible "My Bookings", cleaner mobile menu)
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import Logo from "./Logo"; // by claude
import ThemeToggle from "./ThemeToggle"; // by claude
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

  // by claude: close the mobile menu on Escape (links close it on click), lock page scroll while it is open
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e) => e.key === "Escape" && setIsMenuOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isMenuOpen]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Hotels", path: "/rooms" },
    { name: "Experiences", path: "/experiences" }, // by claude
    { name: "About", path: "/about" }, // by claude
    ...(user ? [{ name: "My Bookings", path: "/my-bookings" }] : []),
  ];

  const handleOwnerButton = () => {
    setIsMenuOpen(false);
    if (isOwner) navigate("/owner");
    else setShowHotelReg(true);
  };

  const ownerButtonLabel = isOwner ? "Dashboard" : "List Your Hotel";

  // by claude: the full desktop navbar needs ~1024px, below that we use the hamburger (tablets were cramped)
  return (
    <nav
      className={`fixed top-0 left-0 w-full flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-16 xl:px-24 py-3 bg-white/80 backdrop-blur-lg border-b border-gray-200/70 transition-shadow duration-300 z-50 ${
        hasScrolled ? "shadow-sm" : ""
      }`}
    >
      {/* Logo */}
      <Link to="/" className="shrink-0">
        <Logo />
      </Link>

      {/* Desktop links */}
      <div className="hidden lg:flex items-center gap-1">
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
      <div className="hidden lg:flex items-center gap-3">
        <ThemeToggle />
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

      {/* Mobile / tablet top bar: Login (or avatar) stays visible, links are in the menu */}
      <div className="flex items-center gap-2 sm:gap-3 lg:hidden">
        <ThemeToggle />
        {user ? (
          <UserButton />
        ) : (
          <button
            onClick={openSignIn}
            className="px-4 py-1.5 rounded-full text-sm font-medium text-white bg-gray-900 hover:bg-black cursor-pointer transition-colors"
          >
            Login
          </button>
        )}
        <button
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={isMenuOpen}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-gray-800 hover:bg-gray-100"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile menu: dim overlay + panel sliding from the right */}
      <div
        onClick={() => setIsMenuOpen(false)}
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 lg:hidden ${
          isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-label="Menu"
        aria-hidden={!isMenuOpen}
        className={`fixed right-0 top-0 z-50 flex h-dvh w-[80%] max-w-xs flex-col bg-white shadow-2xl transition-transform duration-300 lg:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <Logo />
          <button
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-800" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              end
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                `rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                  isActive && !link.placeholder
                    ? "bg-gray-900 text-white"
                    : "text-gray-800 hover:bg-gray-100"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {user && (
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={handleOwnerButton}
              className="w-full cursor-pointer rounded-full border border-gray-900 py-2.5 text-sm font-medium transition-colors hover:bg-gray-900 hover:text-white"
            >
              {ownerButtonLabel}
            </button>
          </div>
        )}
      </aside>
    </nav>
  );
};
