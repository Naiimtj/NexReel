import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NoImage } from '../../assets/image';
import {
  resolveMediaType,
  resolvePosterUrl,
  resolveDate,
  resolveTypeIcon,
} from './mediaCardHelpers';

export const MultiSmall = ({
  info = {},
  mediaMovie = false,
  mediaTv = false,
}) => {
  const [t] = useTranslation('translation');
  const {
    title,
    name,
    media_type,
    poster_path,
    release_date,
    first_air_date,
    known_for_department,
    profile_path,
    id,
  } = info;

  const url = resolvePosterUrl(poster_path, profile_path);
  const bgPoster = url || NoImage;
  const type = resolveMediaType(mediaMovie, mediaTv, media_type);
  const typeIcon = resolveTypeIcon(type);
  const titleText = title || name;
  const linkTo = `/${type}/${id}`;
  resolveDate(release_date, first_air_date, known_for_department);

  return (
    <div className="static cursor-pointer text-gray-200 rounded-xl bg-cover w-full ring-2 ring-inset ring-[#20283E]">
      <div className="static bg-local backdrop-blur-md bg-[#20283E]/80 p-1 rounded-xl h-full grid grid-cols-3">
        <Link to={linkTo} target="_blank">
          <div className="relative">
            <div className="transition ease-in-out md:hover:scale-105 duration-300 py-1.5">
              {url ? (
                <img
                  className="static aspect-auto cursor-pointer rounded-lg"
                  src={bgPoster}
                  alt={titleText}
                />
              ) : (
                <div className="relative flex justify-center items-center">
                  {typeIcon && (
                    <img
                      className="absolute h-24 opacity-10"
                      src={typeIcon}
                      alt={t('Icon people')}
                    />
                  )}
                  <img
                    className="static aspect-auto cursor-pointer rounded-lg"
                    src={bgPoster}
                    alt={t('No photo')}
                  />
                </div>
              )}
            </div>
          </div>
        </Link>
        <div className="col-span-2 mt-2 pl-2 flex flex-col justify-between">
          <Link to={linkTo} target="_blank">
            <div className="mb-2 grid grid-cols-2 gap-4">
              <div className="text-xs align-middle">
                {typeIcon && <img className="w-4" src={typeIcon} alt="" />}
              </div>
            </div>
            <div className="font-semibold text-sm cursor-pointer">
              <p className="line-clamp-3">{titleText}</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default MultiSmall;
