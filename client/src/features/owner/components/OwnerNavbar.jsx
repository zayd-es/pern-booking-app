import { Link } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import Logo from "@/shared/components/ui/Logo"; // by claude

const Navbar = () => {
  return (
    <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white transition-all duration-300">
      <Link to="/">
        <Logo />
      </Link>
      <UserButton />
    </div>
  );
};

export default Navbar;
