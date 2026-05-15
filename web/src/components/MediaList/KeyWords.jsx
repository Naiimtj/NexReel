import { Link } from 'react-router-dom';

function KeyWords({ wordsKey, media = '', id = 0 }) {
  return (
    <div className="static pl-2 w-auto md:max-w-xs lg:max-w-sm xl:max-w-2xl">
      <div className="text-left text-xs mt-1 col-span-9">
        {wordsKey?.map((gen, index) => (
          <div className="inline-block pr-1" key={Number(gen.id * id)}>
            <Link
              to={`/${media}/${id}/keyword/${gen.id}`}
              className="inline-block capitalize cursor-pointer text-purpleNR md:hover:text-gray-400"
            >
              {gen.name}
            </Link>
            {index !== wordsKey.length - 1 && ' - '}
          </div>
        ))}
      </div>
    </div>
  );
}
export default KeyWords;
