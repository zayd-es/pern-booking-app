// by claude: footer redesigned (minimal, top border, small uppercase headings)
import Logo from "./Logo"; // by claude
import { ArrowRight } from "lucide-react"; // by claude
import { FaInstagram, FaFacebookF, FaXTwitter, FaLinkedinIn } from "react-icons/fa6"; // by claude (lucide has no brand icons)

const headingClass =
  "text-xs font-semibold uppercase tracking-wider text-gray-900";
const linkClass = "hover:text-gray-900 transition-colors";

const Footer = () => {
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
            {["About", "Careers", "Press", "Blog", "Partners"].map((item) => (
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
          <p className={headingClass}>Stay updated</p>
          <p className="mt-4 text-sm">
            Subscribe to our newsletter for inspiration and special offers.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center mt-4"
          >
            <input
              type="email"
              className="bg-white rounded-l-full border border-gray-300 h-10 px-4 text-sm outline-none focus:border-gray-900 transition-colors"
              placeholder="Your email"
              required
            />
            <button className="flex items-center justify-center bg-gray-900 hover:bg-black h-10 w-11 rounded-r-full cursor-pointer transition-colors">
              <ArrowRight className="h-4 w-4 text-white" />
            </button>
          </form>
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
