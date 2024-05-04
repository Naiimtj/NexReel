import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const ArrayPaginator = ({
  data,
  totalResult,
  totalPages,
  groupSize,
  currentPageIndex,
  setCurrentPageIndex,
}) => {
  const [t] = useTranslation("translation");
  const totalPagesFinal = totalPages ? totalPages : data.length;

  const goToNextPage = () => {
    setCurrentPageIndex((prevPageIndex) => prevPageIndex + 1);
  };

  const goToPrevPage = () => {
    setCurrentPageIndex((prevPageIndex) => prevPageIndex - 1);
  };
  console.log("currentPageIndex", currentPageIndex);
  console.log("totalPagesFinal", totalPagesFinal);
  console.log("totalPages", totalPages);
  console.log("data", data);
  return (
    <>
      <div className="flex justify-center md:items-center md:justify-between px-4 py-3 sm:px-6">
        <div className="sm:flex sm:flex-1 sm:items-center md:justify-end gap-6">
          <>
            <p className="text-sm mb-2 sm:mb-0 text-gray-600">
              {`${t("Showing")} ${
                (currentPageIndex + 1) * groupSize - groupSize === 0
                  ? 1
                  : (currentPageIndex + 1) * groupSize - groupSize
              } ${t("to")} ${
                (currentPageIndex + 1) * groupSize > totalResult
                  ? totalResult
                  : (currentPageIndex + 1) * groupSize
              } ${t("of")} ${totalResult} ${t("results")}`}
            </p>
          </>
          <div>
            <nav
              className="isolate inline-flex -space-x-px rounded-md shadow-sm"
              aria-label="Pagination"
            >
              {/* // - PREVIOUS BUTTON */}
              <a
                className={`cursor-pointer relative inline-flex items-center rounded-l-md px-2 py-2 ${currentPageIndex === 0 ? "text-grayNR" : "text-purpleNR"} ring-1 ring-inset ring-gray-700 hover:bg-gray-500 hover:text-white focus:z-20 focus:outline-offset-0`}
                onClick={currentPageIndex ? goToPrevPage : null}
                type="submit"
              >
                <span className="sr-only">Previous</span>
                <IoIosArrowBack className="h-5 w-5" aria-hidden="true" />
              </a>
              {/* // - BUTTON PAGE 1 */}
              {currentPageIndex + 1 === 1 ? null : (
                <a
                  className="cursor-pointer relative inline-flex items-center px-4 py-2 text-sm font-semibold text-purpleNR ring-1 ring-inset ring-gray-700 hover:bg-gray-500 hover:text-white focus:z-20 focus:outline-offset-0"
                  onClick={() => setCurrentPageIndex(0)}
                >
                  1
                </a>
              )}
              {/* // - BUTTON DOTS */}
              {currentPageIndex + 1 < 3 ? null : (
                <span className="relative hidden items-center px-2 py-2 text-sm font-semibold text-purpleNR ring-1 ring-inset ring-gray-700 focus:z-20 focus:outline-offset-0 md:inline-flex">
                  ...
                </span>
              )}
              {/* // - BUTTON CURRENT */}
              <a
                aria-current="page"
                className="cursor-pointer relative z-10 inline-flex items-center bg-purpleNR px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purpleNR"
                onClick={() => setCurrentPageIndex(currentPageIndex)}
              >
                {currentPageIndex + 1}
              </a>
              {totalPagesFinal < currentPageIndex + 2 ? null : (
                <a
                  className="cursor-pointer relative inline-flex items-center px-4 py-2 text-sm font-semibold text-purpleNR ring-1 ring-inset ring-gray-700 hover:bg-gray-500 hover:text-white focus:z-20 focus:outline-offset-0"
                  onClick={() => setCurrentPageIndex(currentPageIndex + 1)}
                >
                  {currentPageIndex + 2}
                </a>
              )}
              {totalPagesFinal < currentPageIndex + 3 ? null : (
                <a
                  className="cursor-pointer relative hidden items-center px-4 py-2 text-sm font-semibold text-purpleNR ring-1 ring-inset ring-gray-700 hover:bg-gray-500 hover:text-white focus:z-20 focus:outline-offset-0 md:inline-flex"
                  onClick={() => setCurrentPageIndex(currentPageIndex + 2)}
                >
                  {currentPageIndex + 3}
                </a>
              )}
              {/* // - BUTTON DOTS */}
              {totalPagesFinal <= currentPageIndex + 3 ? null : (
                <span className="relative hidden items-center px-2 py-2 text-sm font-semibold text-purpleNR ring-1 ring-inset ring-gray-700 focus:z-20 focus:outline-offset-0 md:inline-flex">
                  ...
                </span>
              )}
              {totalPagesFinal <= currentPageIndex + 3 ? null : (
                <a
                  className="cursor-pointer relative hidden items-center px-4 py-2 text-sm font-semibold text-purpleNR ring-1 ring-inset ring-gray-700 hover:bg-gray-500 hover:text-white focus:z-20 focus:outline-offset-0 md:inline-flex"
                  onClick={() => setCurrentPageIndex(totalPagesFinal - 1)}
                >
                  {totalPagesFinal}
                </a>
              )}
                <a
                  className={`cursor-pointer relative inline-flex items-center rounded-r-md px-2 py-2 ${totalPagesFinal === currentPageIndex + 1 || totalPagesFinal === 0 ? "text-grayNR" : "text-purpleNR"} ring-1 ring-inset ring-gray-700 hover:bg-gray-500 hover:text-white focus:z-20 focus:outline-offset-0`}
                  onClick={totalPagesFinal === currentPageIndex + 1 || totalPagesFinal === 0 ? null :goToNextPage}
                  type="submit"
                >
                  <span className="sr-only">Next</span>
                  <IoIosArrowForward className="h-5 w-5" aria-hidden="true" />
                </a>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArrayPaginator;

ArrayPaginator.defaultProps = {
  data: [],
  totalResult: 0,
  totalPages: 0,
  groupSize: 0,
  itemsPerPage: 0,
  currentPageIndex: 0,
  setCurrentPageIndex: () => {},
};

ArrayPaginator.propTypes = {
  data: PropTypes.array,
  itemsPerPage: PropTypes.number,
  totalResult: PropTypes.number,
  totalPages: PropTypes.number,
  groupSize: PropTypes.number,
  currentPageIndex: PropTypes.number,
  setCurrentPageIndex: PropTypes.func,
};
