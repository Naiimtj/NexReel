import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BaseIcon } from '../../base';
import { patchMedia, postMedia } from '../../../../services/DB/services-db';

const STAR_COUNT = 10;

const getStarState = (starIndex, activeValue) => {
  if (activeValue == null) return 'empty';
  if (activeValue >= starIndex + 1) return 'full';
  if (activeValue >= starIndex + 0.5) return 'half';
  return 'empty';
};

const Rating = ({
  dataMediaUser = {},
  setPendingSeen = () => {},
  pendingSeen = false,
  mediaId = 0,
  media_type = '',
  runtime = 0,
}) => {
  const { t } = useTranslation('translation');
  const { vote } = dataMediaUser;
  const [rating, setRating] = useState(null);
  const [hover, setHover] = useState(null);
  const [dropDownRating, setdropDownRating] = useState(false);
  const containerRef = useRef(null);
  const starsRef = useRef(null);

  useEffect(() => {
    if (!dropDownRating) return undefined;
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setdropDownRating(false);
        setHover(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [dropDownRating]);

  useEffect(() => {
    setRating(null);
  }, [mediaId]);

  useEffect(() => {
    if (typeof vote === 'number' && vote >= 0) {
      setRating(vote);
    }
  }, [vote]);

  const persistVote = useCallback(
    (value) => {
      const hasRecord =
        Object.keys(dataMediaUser).length > 0 && vote !== undefined;
      if (hasRecord) {
        patchMedia(mediaId, media_type, { seen: true, vote: value }).then(
          () => {
            setPendingSeen(!pendingSeen);
          },
        );
      } else {
        postMedia(media_type, {
          mediaId,
          media_type,
          runtime,
          like: false,
          pending: false,
          seen: true,
          vote: value,
        }).then((data) => {
          if (data) {
            setPendingSeen(!pendingSeen);
          }
        });
      }
    },
    [
      dataMediaUser,
      vote,
      mediaId,
      media_type,
      runtime,
      setPendingSeen,
      pendingSeen,
    ],
  );

  const handleStarClick = useCallback(
    (value) => {
      if (value === rating) return;
      setRating(value);
      persistVote(value);
    },
    [rating, persistVote],
  );

  const handleRemoveRating = useCallback(() => {
    patchMedia(mediaId, media_type, { vote: -1 }).then(() => {
      setPendingSeen(!pendingSeen);
      setRating(null);
      setHover(null);
    });
  }, [mediaId, media_type, setPendingSeen, pendingSeen]);

  const resolveValueFromTouch = useCallback((touchX) => {
    const el = starsRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const x = touchX - rect.left;
    const starWidth = rect.width / STAR_COUNT;
    const starIndex = Math.floor(x / starWidth);
    if (starIndex < 0 || starIndex >= STAR_COUNT) return null;
    const isRightHalf = x % starWidth > starWidth / 2;
    return starIndex + (isRightHalf ? 1 : 0.5);
  }, []);

  const handleTouchMove = useCallback(
    (e) => {
      e.preventDefault();
      const val = resolveValueFromTouch(e.touches[0].clientX);
      if (val != null) setHover(val);
    },
    [resolveValueFromTouch],
  );

  const handleTouchEnd = useCallback(() => {
    if (hover != null) {
      handleStarClick(hover);
      setHover(null);
    }
  }, [hover, handleStarClick]);

  const finalRating = rating < 0 ? null : rating;
  const activeValue = hover ?? finalRating;

  return (
    <div ref={containerRef}>
      <button
        className="cursor-pointer text-left text-purpleNR hover:text-gray-400 transition duration-300 ease-in-out flex items-center gap-0 leading-none"
        onClick={() => setdropDownRating((prev) => !prev)}
        aria-label={t('Toggle rating')}
      >
        <BaseIcon
          icon={finalRating ? 'starFill' : 'starOutline'}
          tooltip={finalRating ? t('Your Rating') : t('Rate this')}
          className="group size-6 md:size-6"
          wrapperClassName="flex"
        />
        <span className="ml-1">{finalRating}</span>
        <BaseIcon
          icon={dropDownRating ? 'caretUpSmall' : 'caretDownSmall'}
          className="group size-6 md:size-6"
          wrapperClassName="flex"
        />
      </button>

      {dropDownRating && (
        <div className="absolute md:left-auto left-0 flex items-center gap-1 bg-[#20283E]/90 backdrop-blur-2xl rounded-md p-1 z-10 mt-1">
          <div
            ref={starsRef}
            role="radiogroup"
            tabIndex={-1}
            aria-label={t('Star rating')}
            className="flex items-center touch-none select-none"
            onMouseLeave={() => setHover(null)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {Array.from({ length: STAR_COUNT }, (_, i) => {
              const state = getStarState(i, activeValue);
              return (
                <div
                  key={i}
                  className="relative cursor-pointer size-6 md:size-6"
                >
                  <BaseIcon
                    icon="starOutline"
                    className="size-6 md:size-6 text-gray-400"
                    wrapperClassName="absolute inset-0"
                  />
                  {state !== 'empty' && (
                    <div
                      className={`absolute inset-0 ${state === 'half' ? '[clip-path:inset(0_50%_0_0)]' : ''}`}
                    >
                      <BaseIcon
                        icon="starFill"
                        className="size-6 md:size-6 text-purpleNR"
                      />
                    </div>
                  )}
                  <div className="absolute inset-0 z-10 flex">
                    <div
                      role="radio"
                      tabIndex={0}
                      aria-checked={finalRating === i + 0.5}
                      aria-label={t('Star half', { value: i + 0.5 })}
                      className="w-full h-full"
                      onMouseEnter={() => setHover(i + 0.5)}
                      onClick={() => handleStarClick(i + 0.5)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ')
                          handleStarClick(i + 0.5);
                      }}
                      onTouchStart={() => setHover(i + 0.5)}
                    />
                    <div
                      role="radio"
                      tabIndex={0}
                      aria-checked={finalRating === i + 1}
                      aria-label={t('Star full value', { value: i + 1 })}
                      className="w-full h-full"
                      onMouseEnter={() => setHover(i + 1)}
                      onClick={() => handleStarClick(i + 1)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ')
                          handleStarClick(i + 1);
                      }}
                      onTouchStart={() => setHover(i + 1)}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <span className="text-purpleNR text-xl font-medium">
            {activeValue ?? ''}
          </span>

          {finalRating != null && (
            <BaseIcon
              icon="close"
              className="size-6 md:size-6 text-gray-400 transition duration-200 hover:text-purpleNR"
              onClick={handleRemoveRating}
              tooltip={t('Remove rating')}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Rating;
