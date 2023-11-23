import { useTranslation } from "react-i18next";

const Header = () => {
  const [t] = useTranslation("translation");
  return (
    <header className="flex justify-center items-center py-4">
      <h1 className="text-white text-4xl capitalize">{t("Chatting")}</h1>
    </header>
  );
};

export default Header;
