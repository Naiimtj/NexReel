import { useEffect, useRef, useState } from 'react';
import CarouselHeader from './CarouselHeader';
import { useCarouselScroll } from './useCarouselScroll';

// Width = --n full cards plus a --peek fraction of the next one, minus the gaps in view.
const SLOT_CLASS =
  'shrink-0 basis-[calc((100%_-_(var(--n)_-_1_+_var(--peek))_*_var(--gap))_/_(var(--n)_+_var(--peek)))]';
const ITEM_CLASS = `snap-start ${SLOT_CLASS}`;
const DEFAULT_COLUMNS =
  '[--n:2] md:[--n:4] lg:[--n:5] xl:[--n:6] [--peek:0.25] [--gap:0.5rem] md:[--gap:0.75rem]';
const EAGER_ITEMS = 12;

const LazyItem = ({ rootRef, eager = false, children }) => {
  const itemRef = useRef(null);
  const [isMounted, setIsMounted] = useState(eager);

  useEffect(() => {
    if (isMounted) return undefined;
    // Mount cards up to one view away so data and posters are ready on scroll.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsMounted(true);
      },
      { root: rootRef.current, rootMargin: '0px 100%' },
    );
    observer.observe(itemRef.current);
    return () => observer.disconnect();
  }, [isMounted, rootRef]);

  return (
    <div ref={itemRef} className={ITEM_CLASS}>
      {isMounted ? (
        children
      ) : (
        <div className="h-full w-full rounded-2xl bg-white/5" />
      )}
    </div>
  );
};

/**
 * Shared horizontal carousel: header with arrows plus a scroll-snap track.
 * `columnsClassName` sets the CSS vars --n (cards per view), --peek and --gap.
 */
const CarouselRow = ({
  title = '',
  count = 0,
  showCount = false,
  onTitleClick = undefined,
  titleClassName = undefined,
  items = [],
  columnsClassName = DEFAULT_COLUMNS,
  trackClassName = '',
  getKey = (_item, index) => index,
  renderItem,
  onTrackClick = undefined,
  onEndReached = undefined,
}) => {
  const trackRef = useRef(null);
  const endRef = useRef(null);
  const { hasOverflow, canPrev, canNext, scrollPrev, scrollNext } =
    useCarouselScroll(trackRef, items.length + (onEndReached ? 1 : 0));

  useEffect(() => {
    if (!onEndReached) return undefined;
    // Re-created on every items update, so it fires again while the end is still in range.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onEndReached();
      },
      { root: trackRef.current, rootMargin: '0px 100%' },
    );
    observer.observe(endRef.current);
    return () => observer.disconnect();
  }, [onEndReached, items]);

  return (
    <>
      <CarouselHeader
        title={title}
        count={count}
        showCount={showCount}
        showNav={hasOverflow}
        canPrev={canPrev}
        canNext={canNext}
        onPrev={scrollPrev}
        onNext={scrollNext}
        onTitleClick={onTitleClick}
        titleClassName={titleClassName}
      />
      {/* minmax(0,1fr) column: the cards' total width never widens intrinsically sized parents. */}
      <div className="grid grid-cols-1">
        <div
          ref={trackRef}
          className={`flex gap-[var(--gap)] overflow-x-auto overscroll-x-contain snap-x snap-mandatory py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${columnsClassName} ${trackClassName}`}
          onClick={onTrackClick}
        >
          {items.map((item, index) => (
            <LazyItem
              key={getKey(item, index)}
              rootRef={trackRef}
              eager={index < EAGER_ITEMS}
            >
              {renderItem(item, index)}
            </LazyItem>
          ))}
          {/* Not a snap target: re-snapping to it after an append would jump to the new end. */}
          {onEndReached && (
            <div ref={endRef} className={SLOT_CLASS} aria-hidden="true">
              <div className="h-full w-full rounded-2xl bg-white/5 motion-safe:animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CarouselRow;
