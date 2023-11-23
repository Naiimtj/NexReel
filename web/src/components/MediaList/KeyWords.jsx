import PropTypes from "prop-types";
import { Link } from "react-router-dom";

function KeyWords({ wordsKey, media, id }) {
  return (
    <div className="static pl-2 w-auto md:max-w-xs lg:max-w-sm xl:max-w-2xl ">
      <div className="text-left text-xs mt-1 col-span-9">
        {wordsKey &&
          wordsKey.map((gen, index) => {
            const idkeyword = gen && gen.id;
            return (
              <div className="inline-block pr-1 " key={Number(gen.id * id)}>
                <Link
                  to={`/${media}/${id}/keyword/${idkeyword}`}
                  className="inline-block capitalize cursor-pointer text-gray-200 hover:text-gray-400"
                >
                  {gen.name}
                </Link>
                {index !== wordsKey.length - 1 ? " - " : ""}
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default KeyWords;

KeyWords.defaultProps = {
  media: "",
  id1: 0,
};

KeyWords.propTypes = {
  wordsKey: PropTypes.array,
  media: PropTypes.string,
  id: PropTypes.number,
};
