import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
// service
import { getTrending } from "../../../services/TMDB/services-tmdb";
// components/utils
import Carousel from "../../utils/Carousel/Carousel";

const Trending = () => {
  const [t, i18next] = useTranslation("translation");
  const [loading, setLoading] = useState(true);
  const [dataTrending, setDataTrending] = useState([]);
  const [isChange, isSetChange] = useState(true);
  useEffect(() => {
    if (i18next.language) {
      getTrending(i18next.language).then((data) => {
        setDataTrending(data.results);
        setLoading(false);
      });
    }
  }, [i18next.language]);
  return (
    <div className="mb-20">
      {!loading && dataTrending.length > 0 ? (
        <Carousel title={t("Trending")} info={dataTrending}               isChange={isChange}
        isSetChange={isSetChange} />
      ) : null}
    </div>
  );
};

export default Trending;
