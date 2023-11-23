import { useTranslation } from "react-i18next";

function NotFoundPage() {
  const [t] = useTranslation("translation");
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl text-gray-700 font-bold">404</h1>
        <p className="text-2xl text-gray-600">{t("Page not found")}</p>
      </div>
    </div>
  );
}

export default NotFoundPage;
