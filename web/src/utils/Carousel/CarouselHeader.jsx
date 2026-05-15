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

  const baseArrowClass =
    'transition ease-in-out md:hover:scale-110 duration-300';
  const enabledArrowClass = `text-[#6676a7] md:hover:text-gray-200 ${baseArrowClass}`;
  const disabledArrowClass = 'text-gray-700';

  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-1 text-gray-200 items-center">
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
        {showCount && title ? <p>{`( ${count} )`}</p> : null}
      </div>
      {showNav ? (
        <div className="flex">
          <div className="align-middle">
            <BaseIcon
              icon="arrowLeft"
              size="large"
              onClick={canPrev ? onPrev : undefined}
              tooltip={t('Previous')}
              className={canPrev ? enabledArrowClass : disabledArrowClass}
            />
          </div>
          <div className="align-middle">
            <BaseIcon
              icon="arrowRight"
              size="large"
              onClick={canNext ? onNext : undefined}
              tooltip={t('Next')}
              className={canNext ? enabledArrowClass : disabledArrowClass}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};
export default CarouselHeader;
