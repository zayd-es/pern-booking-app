// by claude: was a fake newsletter form (saved nothing). Now a call to action for hotel owners.
import { useNavigate } from "react-router-dom";
import Title from "../../common/Title";
import { useAppStore } from "../../../store/useAppStore";

const NewsLetter = () => {
  const navigate = useNavigate();
  const isOwner = useAppStore((state) => state.isOwner);
  const setShowHotelReg = useAppStore((state) => state.setShowHotelReg);

  const handleClick = () => {
    if (isOwner) navigate("/owner");
    else setShowHotelReg(true);
  };

  return (
    <section className="px-6 md:px-16 lg:px-24 xl:px-32 py-16 md:py-20">
      <div className="flex flex-col items-center rounded-3xl border border-gray-200 bg-gray-50 px-4 py-12 md:py-16">
        <Title
          title="Own a hotel or riad?"
          subTitle="List your property on Zayd, add your rooms and start receiving bookings from guests all over the world."
        />
        <button
          onClick={handleClick}
          className="mt-8 shrink-0 cursor-pointer rounded-full bg-gray-900 px-7 py-3 text-sm font-medium text-white transition-all hover:bg-black active:scale-95"
        >
          {isOwner ? "Go to your dashboard" : "List your hotel"}
        </button>
        <p className="text-gray-500 mt-5 text-xs text-center">
          Free to list. You manage your rooms, prices and bookings from your dashboard.
        </p>
      </div>
    </section>
  );
};

export default NewsLetter;
