import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { BaseIcon } from '../../components/base';

const MAX_VISIBLE_DOTS = 7;

/**
 * Build a windowed list of pages around the current one so the dot row never
 * overflows the screen. Returns an array containing page numbers and the
 * sentinel string '…' for gaps.
 */
const buildPageWindow = (totalPages, currentPage, maxVisible) => {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const sideCount = Math.floor((maxVisible - 3) / 2);
  let start = Math.max(2, currentPage - sideCount);
  let end = Math.min(totalPages - 1, currentPage + sideCount);

  const slotsLeft = maxVisible - 2;
  if (end - start + 1 < slotsLeft) {
    if (start === 2) {
      end = Math.min(totalPages - 1, start + slotsLeft - 1);
    } else if (end === totalPages - 1) {
      start = Math.max(2, end - slotsLeft + 1);
    }
  }

  const pages = [1];
  if (start > 2) pages.push('…');
  for (let p = start; p <= end; p += 1) pages.push(p);
  if (end < totalPages - 1) pages.push('…');
  pages.push(totalPages);
  return pages;
};

/**
 * Page indicator dots for the Carousel family. Each dot is clickable and
 * jumps to its page. Icons go through BaseIcon per the project-wide rule.
 * When totalPages exceeds MAX_VISIBLE_DOTS, the row collapses with ellipsis
 * separators around the current page so it never overflows the viewport.
 */
const CarouselDots = ({ totalPages, currentPage, onSelect, keyPrefix }) => {
  const [t] = useTranslation('translation');

  const pages = useMemo(
    () => buildPageWindow(totalPages, currentPage, MAX_VISIBLE_DOTS),
    [totalPages, currentPage],
  );

  if (!totalPages || totalPages <= 1) return null;

  const dotClass =
    'text-[#6676a7] transition ease-in-out md:hover:scale-110 md:hover:text-gray-200 duration-300';

  return (
    <div className="flex justify-center items-center gap-0.5 flex-nowrap max-w-full">
      {pages.map((page, idx) => {
        if (typeof page === 'string') {
          return (
            <span
              key={`${keyPrefix}-ellipsis-${idx}`}
              className="text-[#6676a7] text-xs px-1 select-none"
              aria-hidden="true"
            >
              …
            </span>
          );
        }
        const isActive = page === currentPage;
        return (
          <BaseIcon
            key={`${keyPrefix}-dot-${page}`}
            icon={isActive ? 'dotFill' : 'dot'}
            size="small"
            onClick={() => onSelect(page)}
            tooltip={t('Page {{n}}', { n: page })}
            className={dotClass}
          />
        );
      })}
    </div>
  );
};

CarouselDots.defaultProps = {
  keyPrefix: 'carousel',
};

CarouselDots.propTypes = {
  totalPages: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  onSelect: PropTypes.func.isRequired,
  keyPrefix: PropTypes.string,
};

export default CarouselDots;
