// by claude: modern heading (sans font, tighter tracking), fixed the "false" class when align is not left
const Title = ({ title, subTitle, align }) => {
  return (
    <div
      className={`flex flex-col justify-center items-center text-center ${
        align === "left" ? "md:items-start md:text-left" : ""
      }`}
    >
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900">
        {title}
      </h1>
      <p className="text-sm md:text-base text-gray-500 mt-2 max-w-174">
        {subTitle}
      </p>
    </div>
  );
};

export default Title;
