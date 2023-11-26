import { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { IoAddOutline } from "react-icons/io5";
import { TbMinus } from "react-icons/tb";
import SearchMedias from "./SearchMedias";

const AddMediaForum = ({
  basicForum,
  changeSeenPending,
  setChangeSeenPending,
}) => {
  const [t] = useTranslation("translation");
  const [addMediaForum, setAddMediaForum] = useState(false);
  const [hidden, setHidden] = useState(false);

  return (
    <div className="flex flex-col items-center">
      {/* // - ADD MEDIA FORUM */}
      <div
        className={`mr-2 flex items-center justify-center w-[200px] bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-2 p-1 border-2 border-[#7B6EF6]  hover:border-[#494949] uppercase  md:hover:text-white transition duration-200 ${
          addMediaForum
            ? "cursor-pointer bg-[#494949] mb-4"
            : "cursor-pointer text-purpleNR bg-[#494949]/50"
        }`}
        onClick={() => setAddMediaForum(!addMediaForum)}
      >
        {!addMediaForum ? (
          <IoAddOutline className="h-12 w-12 md:h-7 md:w-7" />
        ) : (
          <TbMinus className="h-12 w-12 md:h-7 md:w-7" />
        )}
        <p>{t("Add Media")}</p>
      </div>
      {/* // - SEARCH USERS */}
      {addMediaForum ? (
        <div className="flex justify-center mb-4">
          <SearchMedias
            basicForum={basicForum}
            hidden={hidden}
            setHidden={setHidden}
            changeSeenPending={changeSeenPending}
            setChangeSeenPending={setChangeSeenPending}
          />
        </div>
      ) : null}
    </div>
  );
};

export default AddMediaForum;

AddMediaForum.defaultProps = {
    basicForum: {},
    changeSeenPending: false,
    setChangeSeenPending: () => {},
  };
  
  AddMediaForum.propTypes = {
    basicForum: PropTypes.object,
    changeSeenPending: PropTypes.bool,
    setChangeSeenPending: PropTypes.func,
  };