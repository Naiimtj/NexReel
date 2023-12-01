import Trending from "../components/MediaList/Trending";

const Home = () => {
  document.title = `${"NexReel"}`;
  return (
    <div className="mt-10">
      <Trending />
    </div>
  );
};

export default Home;
