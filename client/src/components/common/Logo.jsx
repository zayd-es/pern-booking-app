// by claude: "Zayd" logo (mark + wordmark). The same mark is used as favicon (public/favicon.svg)
import { useId } from "react";

const Logo = ({ className = "", textClassName = "text-gray-900", size = 32 }) => {
  const gradientId = useId();
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="0"
            y1="0"
            x2="32"
            y2="32"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#2563eb" />
            <stop offset="1" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="9" fill={`url(#${gradientId})`} />
        <path
          d="M10 10.5h12L10 21.5h12"
          fill="none"
          stroke="#fff"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="24.5" cy="7.5" r="2.3" fill="#fbbf24" />
      </svg>
      <span
        className={`text-xl font-semibold tracking-tight leading-none ${textClassName}`}
      >
        Zayd
      </span>
    </span>
  );
};

export default Logo;
