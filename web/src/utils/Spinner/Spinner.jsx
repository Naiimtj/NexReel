import "./Spinner.css";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

const Spinner = ({ result }) => {
  const [t] = useTranslation("translation");
  return (
    <>
      {result ? (
        <div className="sk-folding-cube">
          <div className="sk-cube1 sk-cube" />
          <div className="sk-cube2 sk-cube" />
          <div className="sk-cube4 sk-cube" />
          <div className="sk-cube3 sk-cube" />
        </div>
      ) : (
        <p className="text-center text-2xl font-bold text-[#E4002B] mt-10">
          {t("DATA IS EMPTY. PLEASE TRY AGAIN LATER OR CONTACT THE MANAGER")}
        </p>
      )}
    </>
  );
};

export default Spinner;

Spinner.defaultProps = {
  result: true,
};

Spinner.propTypes = {
  result: PropTypes.bool,
};
