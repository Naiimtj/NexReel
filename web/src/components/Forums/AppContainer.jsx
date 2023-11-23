import PropTypes from "prop-types";

const AppContainer = ({ children }) => {
  return <div className="relative flex flex-col mt-6 h-full w-full">{children}</div>;
};

export default AppContainer;

AppContainer.defaultProps = {
  children: [],
};

AppContainer.propTypes = {
  children: PropTypes.array,
};
