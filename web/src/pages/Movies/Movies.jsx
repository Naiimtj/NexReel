import { useTranslation } from "react-i18next";
import Streaming from "../../components/MediaList/Streaming";
import Top from "../../components/MediaList/Top";

const Movies = () => {
  const [t] = useTranslation("translation");
  document.title = `${t("Movies")}`;
  return (
    <>
      <div className="mt-10">
        <Top media={'movie'}/>
      </div>
      <div className="pb-20">
        <Streaming media={'movie'}/>
      </div>
    </>
  );
};

export default Movies;
