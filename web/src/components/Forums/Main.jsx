import PropTypes from "prop-types";
import ForumList from "./ForumList";

const Main = ({ posts, setPopSureDel, setIdDelete, change, setChange }) => {
  return (
    <main className="flex flex-col px-4 py-4 relative text-gray-200 rounded-2xl bg-cover w-full">
      <div className="flex flex-col justify-between gap-x-6 py-2 static bg-local backdrop-blur-md bg-[#20283E]/80 p-2 rounded-xl h-full">
        {posts.map((post, index) =>
          index < 4 ? (
            <ForumList
              key={post.id}
              info={post}
              setPopSureDel={setPopSureDel}
              setIdDelete={setIdDelete}
              change={change}
              setChange={setChange}
            />
          ) : null
        )}
      </div>
    </main>
  );
};

export default Main;

Main.defaultProps = {
  posts: [],
  setPopSureDel: () => {},
  setIdDelete: () => {},
  change: false,
  setChange: () => {},
};

Main.propTypes = {
  posts: PropTypes.array,
  setPopSureDel: PropTypes.func,
  setIdDelete: PropTypes.func,
  change: PropTypes.bool,
  setChange: PropTypes.func,
};
