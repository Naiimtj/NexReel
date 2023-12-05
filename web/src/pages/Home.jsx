import Trending from "../components/MediaList/Trending";
import PageTitle from "../components/PageTitle";

const Home = () => {
  return (
    <div className="mt-10">
      <PageTitle title="NexReel" />
      <Trending />
    </div>
  );
};

export default Home;
