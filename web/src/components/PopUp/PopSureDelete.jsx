import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

export default function PopSureDelete({ setPopSureDel, setAnswerDel }) {
  const [t] = useTranslation("translation");

  const AnswerYes = () => {
    setPopSureDel(false);
    setAnswerDel(true);
  };
  const AnswerNo = () => {
    setPopSureDel(false);
    setAnswerDel(false);
  };

  return (
    <div className="bg-white text-black grid grid-cols-2 py-4 px-2 rounded-xl shadow-xl text-center text-xl w-[500px] h-[150px] mt-[50px]">
      <div className="col-span-2 font-semibold mt-3">{`${t(
        "Are you sure you want to delete?"
      )}`}</div>
      <button
        type="button"
        onClick={AnswerYes}
        className="text-xl hover:text-purple-900 hover:bg-gray-500/10 transition duration-300"
      >
        {t("Yes")}
      </button>
      <button
        type="button"
        onClick={AnswerNo}
        className="text-xl hover:text-purple-900 hover:bg-gray-500/10 transition duration-300"
      >
        {t("No")}
      </button>
    </div>
  );
}

PopSureDelete.defaultProps = {
  setPopSureDel: () => {},
  servicesetAnswerDelsDelete: () => {},
};

PopSureDelete.propTypes = {
  setPopSureDel: PropTypes.func,
  setAnswerDel: PropTypes.func,
};
