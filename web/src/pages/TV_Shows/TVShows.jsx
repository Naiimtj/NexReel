import Streaming from "../../components/MediaList/Streaming";
import Top from "../../components/MediaList/Top";

const TVShows = () => {
  return (
    <div>
      <div className="mt-10">
        <Top media={"tv"} />
      </div>
      <div className="pb-20">
        <Streaming media={"tv"} />
      </div>
    </div>
  );
};

export default TVShows;
