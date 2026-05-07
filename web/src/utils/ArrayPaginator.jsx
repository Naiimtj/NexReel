import { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

const ArrayPaginator = ({
  data = [],
  totalResult = 0,
  totalPages = 0,
  groupSize = 0,
  currentPageIndex = 0,
  setCurrentPageIndex = () => {},
}) => {
  const [t] = useTranslation('translation');
  const [jumpOpen, setJumpOpen] = useState(false);
  const [jumpValue, setJumpValue] = useState('');

  const totalPagesFinal = totalPages || data.length;
  const isFirst = currentPageIndex === 0;
  const isLast =
    totalPagesFinal === currentPageIndex + 1 || totalPagesFinal === 0;

  const goToPage = (i) => () => setCurrentPageIndex(i);
  const goToPrev = () => setCurrentPageIndex((i) => i - 1);
  const goToNext = () => setCurrentPageIndex((i) => i + 1);

  const handleJump = () => {
    const page = parseInt(jumpValue, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPagesFinal) {
      setCurrentPageIndex(page - 1);
    }
    setJumpOpen(false);
    setJumpValue('');
  };

  const pageBtn =
    'cursor-pointer relative inline-flex items-center px-4 py-2 text-sm font-semibold text-purpleNR ring-1 ring-inset ring-gray-700 hover:bg-gray-500 hover:text-white focus:z-20 focus:outline-offset-0';
  const dotsBtn =
    'cursor-pointer relative inline-flex items-center px-2 py-2 text-sm font-semibold text-purpleNR ring-1 ring-inset ring-gray-700 hover:bg-gray-500 hover:text-white focus:z-20 focus:outline-offset-0';

  const fromItem =
    (currentPageIndex + 1) * groupSize - groupSize === 0
      ? 1
      : (currentPageIndex + 1) * groupSize - groupSize;
  const toItem =
    (currentPageIndex + 1) * groupSize > totalResult
      ? totalResult
      : (currentPageIndex + 1) * groupSize;

  const jumpInput = (
    <input
      autoFocus
      type="number"
      min={1}
      max={totalPagesFinal}
      value={jumpValue}
      onChange={(e) => setJumpValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleJump();
        if (e.key === 'Escape') {
          setJumpOpen(false);
          setJumpValue('');
        }
      }}
      onBlur={handleJump}
      className="relative w-14 px-2 py-2 text-sm font-semibold text-purpleNR ring-1 ring-inset ring-gray-700 bg-transparent text-center focus:outline-none"
    />
  );

  const dotsButton = (
    <button
      type="button"
      onClick={() => setJumpOpen(true)}
      className={dotsBtn}
      title={t('Go to page')}
    >
      ...
    </button>
  );

  return (
    <div className="flex justify-center md:items-center md:justify-between px-4 py-3 sm:px-6">
      <div className="sm:flex sm:flex-1 sm:items-center md:justify-end gap-6">
        <p className="text-sm mb-2 sm:mb-0 text-gray-600">
          {`${t('Showing')} ${fromItem} ${t('to')} ${toItem} ${t('of')} ${totalResult} ${t('results')}`}
        </p>
        <nav
          className="isolate inline-flex -space-x-px rounded-md shadow-sm"
          aria-label="Pagination"
        >
          <button
            type="button"
            disabled={isFirst}
            className={`cursor-pointer relative inline-flex items-center rounded-l-md px-2 py-2 ${isFirst ? 'text-grayNR' : 'text-purpleNR'} ring-1 ring-inset ring-gray-700 hover:bg-gray-500 hover:text-white focus:z-20 focus:outline-offset-0`}
            onClick={goToPrev}
          >
            <span className="sr-only">Previous</span>
            <IoIosArrowBack className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Page 1 — desktop only */}
          {currentPageIndex + 1 > 1 && (
            <button
              type="button"
              className={`${pageBtn} hidden md:inline-flex`}
              onClick={goToPage(0)}
            >
              1
            </button>
          )}

          {/* Left dots — desktop only, not clickable */}
          {currentPageIndex + 1 >= 3 && (
            <span className="relative hidden items-center px-2 py-2 text-sm font-semibold text-purpleNR ring-1 ring-inset ring-gray-700 focus:z-20 focus:outline-offset-0 md:inline-flex">
              ...
            </span>
          )}

          {/* Current page */}
          <button
            type="button"
            aria-current="page"
            className="cursor-pointer relative z-10 inline-flex items-center bg-purpleNR px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purpleNR"
          >
            {currentPageIndex + 1}
          </button>

          {/* Current + 1 */}
          {totalPagesFinal >= currentPageIndex + 2 && (
            <button
              type="button"
              className={pageBtn}
              onClick={goToPage(currentPageIndex + 1)}
            >
              {currentPageIndex + 2}
            </button>
          )}

          {/* Current + 2 — desktop only */}
          {totalPagesFinal >= currentPageIndex + 3 && (
            <button
              type="button"
              className={`${pageBtn} hidden md:inline-flex`}
              onClick={goToPage(currentPageIndex + 2)}
            >
              {currentPageIndex + 3}
            </button>
          )}

          {/* Right dots + last — desktop only */}
          {totalPagesFinal > currentPageIndex + 3 && (
            <>
              <span className="hidden md:inline-flex">
                {jumpOpen ? jumpInput : dotsButton}
              </span>
              <button
                type="button"
                className={`${pageBtn} hidden md:inline-flex`}
                onClick={goToPage(totalPagesFinal - 1)}
              >
                {totalPagesFinal}
              </button>
            </>
          )}

          {/* Right dots — mobile only, shown when last page is not current+1 */}
          {totalPagesFinal > currentPageIndex + 3 && (
            <span className="inline-flex md:hidden">
              {jumpOpen ? jumpInput : dotsButton}
            </span>
          )}

          {/* Last page — mobile only */}
          {totalPagesFinal > currentPageIndex + 2 && (
            <button
              type="button"
              className={`${pageBtn} inline-flex md:hidden`}
              onClick={goToPage(totalPagesFinal - 1)}
            >
              {totalPagesFinal}
            </button>
          )}

          <button
            type="button"
            disabled={isLast}
            className={`cursor-pointer relative inline-flex items-center rounded-r-md px-2 py-2 ${isLast ? 'text-grayNR' : 'text-purpleNR'} ring-1 ring-inset ring-gray-700 hover:bg-gray-500 hover:text-white focus:z-20 focus:outline-offset-0`}
            onClick={goToNext}
          >
            <span className="sr-only">Next</span>
            <IoIosArrowForward className="h-5 w-5" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </div>
  );
};

ArrayPaginator.propTypes = {
  data: PropTypes.array,
  totalResult: PropTypes.number,
  totalPages: PropTypes.number,
  groupSize: PropTypes.number,
  currentPageIndex: PropTypes.number,
  setCurrentPageIndex: PropTypes.func,
};

export default ArrayPaginator;
