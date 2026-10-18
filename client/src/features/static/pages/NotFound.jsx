// by claude: 404 page for unknown URLs
import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 pt-24 text-center">
    <p className="text-6xl font-semibold tracking-tight text-gray-900">404</p>
    <h1 className="text-xl font-medium text-gray-900">Page not found</h1>
    <p className="max-w-md text-gray-500">
      The page you are looking for doesn't exist or was moved.
    </p>
    <Link
      to="/"
      className="rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-black"
    >
      Back to home
    </Link>
  </div>
);

export default NotFound;
