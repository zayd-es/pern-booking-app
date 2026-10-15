// by claude: footer redesigned (minimal, top border, small uppercase headings)
import Logo from "./Logo"; // by claude
import { Link, useNavigate } from "react-router-dom"; // by claude
import { useAppStore } from "../../store/useAppStore"; // by claude
import { ArrowRight } from "lucide-react"; // by claude
import { FaInstagram, FaFacebookF, FaXTwitter, FaLinkedinIn } from "react-icons/fa6"; // by claude (lucide has no brand icons)

const headingClass =
  "text-xs font-semibold uppercase tracking-wider text-gray-900";
const linkClass = "hover:text-gray-900 transition-colors";

const Footer = () => {
  const navigate = useNavigate(); // by claude
  const isOwner = useAppStore((state) => state.isOwner); // by claude
  const setShowHotelReg = useAppStore((state) => state.setShowHotelReg); // by claude
  return (
    <footer className="border-t border-gray-200 text-gray-500 pt-12 px-6 md:px-16 lg:px-24 xl:px-32">
      <div className="flex flex-wrap justify-between gap-10 md:gap-6">
        <div className="max-w-80">
          <Logo className="mb-4" />
          <p className="text-sm">
            Discover the world's most extraordinary places to stay, from
            boutique hotels to luxury villas and private islands.
          </p>
          <div className="flex items-center gap-3 mt-5">
            {[
              [FaInstagram, "Instagram"],
              [FaFacebookF, "Facebook"],
              [FaXTwitter, "X"],
              [FaLinkedinIn, "LinkedIn"],
            ].map(([Icon, label]) => (
              <Icon
                key={label}
                aria-label={label}
                className="h-4.5 w-4.5 cursor-pointer text-gray-500 transition-colors hover:text-gray-900"
              />
            ))}
          </div>
        </div>

        <div>
          <p className={headingClass}>Company</p>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm">
            {/* by claude: About + Experiences are real pages now */}
            <li>
              <Link to="/about" onClick={() => window.scrollTo(0, 0)} className={linkClass}>
                About
              </Link>
            </li>
            <li>
              <Link to="/experiences" onClick={() => window.scrollTo(0, 0)} className={linkClass}>
                Experiences
              </Link>
            </li>
            {["Careers", "Press", "Blog"].map((item) => (
              <li key={item}>
                <a href="#" className={linkClass}>
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className={headingClass}>Support</p>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm">
            {[
              "Help Center",
              "Safety Information",
              "Cancellation Options",
              "Contact Us",
              "Accessibility",
            ].map((item) => (
              <li key={item}>
                <a href="#" className={linkClass}>
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="max-w-80">
          <p className={headingClass}>For hotel owners</p>
          <p className="mt-4 text-sm">
            List your hotel or riad and start receiving bookings.
          </p>
          {/* by claude: replaced the fake newsletter form */}
          <button
            onClick={() => (isOwner ? navigate("/owner") : setShowHotelReg(true))}
            className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-sm text-white transition-colors hover:bg-black"
          >
            {isOwner ? "Dashboard" : "List your hotel"} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-2 items-center justify-between border-t border-gray-200 mt-10 py-6 text-sm">
        <p>© {new Date().getFullYear()} Zayd. All rights reserved.</p>
        <ul className="flex items-center gap-5">
          {["Privacy", "Terms", "Sitemap"].map((item) => (
            <li key={item}>
              <a href="#" className={linkClass}>
                {item}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
