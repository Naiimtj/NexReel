import PropTypes from 'prop-types';
import { BsGrid3X2GapFill, BsListUl } from 'react-icons/bs';
import { MdViewCarousel } from 'react-icons/md';

const ACTIVE = 'text-purpleNR';
const INACTIVE =
  'cursor-pointer md:hover:text-purpleNR text-gray-500 transition ease-in-out md:hover:scale-110 duration-200';

const ViewToggle = ({ visualDesign, setVisualDesign }) => {
  return (
    <div className="flex items-center">
      {/* CAROUSEL */}
      <div className={`mr-2 ${visualDesign === 0 ? ACTIVE : INACTIVE}`}>
        <MdViewCarousel
          className="h-14 w-14 md:h-8 md:w-8"
          onClick={() => setVisualDesign(0)}
        />
      </div>
      {/* SQUARE */}
      <div className={`mr-2 ${visualDesign === 1 ? ACTIVE : INACTIVE}`}>
        <BsGrid3X2GapFill
          className="h-14 w-14 md:h-8 md:w-8"
          onClick={() => setVisualDesign(1)}
        />
      </div>
      {/* LIST */}
      <div className={`mr-2 ${visualDesign === 2 ? ACTIVE : INACTIVE}`}>
        <BsListUl
          className="h-14 w-14 md:h-8 md:w-8"
          onClick={() => setVisualDesign(2)}
        />
      </div>
    </div>
  );
};

ViewToggle.propTypes = {
  visualDesign: PropTypes.number.isRequired,
  setVisualDesign: PropTypes.func.isRequired,
};

export default ViewToggle;
