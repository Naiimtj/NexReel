import { useTranslation } from 'react-i18next';
import { BaseIcon, BaseButton } from '../../components/base';

/**
 * Shared header for the Carousel family: title, optional count, and
 * prev/next navigation arrows. Arrow icons go through BaseIcon (per the
 * project-wide icon rule) and receive translated tooltips.
 */
const CarouselHeader = ({
  title = '',
  count = 0,
  showCount = false,
  showNav = false,
  canPrev = false,
  canNext = false,
  onPrev = () => {},
  onNext = () => {},
  onTitleClick = undefined,
  titleClassName = 'pl-4 text-sm md:text-2xl uppercase',
}) => {
  const [t] = useTranslation('translation');

  const arrowClass = (enabled) =>
    `size-8 rounded-full p-1.5 ring-1 ring-inset transition duration-200 ${
      enabled
        ? 'bg-white/5 text-gray-200 ring-white/10 md:hover:bg-white/15 md:hover:ring-white/25'
        : 'text-gray-500 ring-white/5 opacity-40'
    }`;

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-2 text-gray-200">
        {onTitleClick ? (
          <BaseButton
            variant="primary"
            onClick={onTitleClick}
            className={titleClassName}
          >
            {title}
          </BaseButton>
        ) : (
          <h1 className={titleClassName}>{title}</h1>
        )}
        {showCount && title ? (
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-gray-300">
            {count}
          </span>
        ) : null}
      </div>
      {showNav ? (
        <div className="flex shrink-0 items-center gap-2">
          <BaseIcon
            icon="arrowLeft"
            onClick={canPrev ? onPrev : undefined}
            tooltip={t('Previous')}
            className={arrowClass(canPrev)}
          />
          <BaseIcon
            icon="arrowRight"
            onClick={canNext ? onNext : undefined}
            tooltip={t('Next')}
            className={arrowClass(canNext)}
          />
        </div>
      ) : null}
    </div>
  );
};
export default CarouselHeader;
