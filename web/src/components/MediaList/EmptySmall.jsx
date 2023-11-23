import { useTranslation } from "react-i18next";
import { BsGrid3X2GapFill } from "react-icons/bs";

export const EmptySmall = () => {
  const [t] = useTranslation("translation");
  return (
    <div className="cursor-pointer p-1 flex flex-col items-center justify-center w-full h-full transition ease-in-out md:hover:scale-105 duration-200 text-[#9c95e1] md:hover:text-gray-500">
      <div className="col-span-2 flex items-center justify-end">
        <BsGrid3X2GapFill className="h-[60px] w-[60px]" />
      </div>
      <div className="font-semibold text-xs cursor-pointer">
        <p className="line-clamp-3">{t("See all")}</p>
      </div>
    </div>
  );
};

export default EmptySmall;
