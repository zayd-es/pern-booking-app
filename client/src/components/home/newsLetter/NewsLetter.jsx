// by claude: redesigned (light card, black button), fixed class -> className
import Title from "../../common/Title";

const NewsLetter = () => {
  return (
    <section className="px-6 md:px-16 lg:px-24 xl:px-32 py-16 md:py-20">
      <div className="flex flex-col items-center rounded-3xl border border-gray-200 bg-gray-50 px-4 py-12 md:py-16">
        <Title
          title="Stay inspired"
          subTitle="Join our newsletter and be the first to discover new destinations and exclusive offers."
        />
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8 w-full max-w-md"
        >
          <input
            type="email"
            className="w-full bg-white px-4 py-3 border border-gray-300 rounded-full text-sm outline-none focus:border-gray-900 transition-colors"
            placeholder="Enter your email"
            required
          />
          <button className="w-full sm:w-auto shrink-0 bg-gray-900 hover:bg-black text-white text-sm font-medium px-7 py-3 rounded-full active:scale-95 transition-all cursor-pointer">
            Subscribe
          </button>
        </form>
        <p className="text-gray-500 mt-5 text-xs text-center">
          By subscribing, you agree to our Privacy Policy and consent to receive
          updates.
        </p>
      </div>
    </section>
  );
};

export default NewsLetter;
