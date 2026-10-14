// by claude: lucide icon for each room amenity (case-insensitive, so "Free Wifi" and "Free WiFi" both work)
import { Wifi, Coffee, ConciergeBell, Mountain, Waves, Check } from "lucide-react";

const ICONS = {
  "free wifi": Wifi,
  "free breakfast": Coffee,
  "room service": ConciergeBell,
  "mountain view": Mountain,
  "pool access": Waves,
};

const FacilityIcon = ({ name, className = "h-4 w-4" }) => {
  const Icon = ICONS[String(name).toLowerCase()] || Check;
  return <Icon className={className} aria-hidden="true" />;
};

export default FacilityIcon;
