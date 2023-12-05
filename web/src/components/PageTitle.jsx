import { useEffect } from 'react';
import PropTypes from "prop-types";

const PageTitle  = ({ title }) => {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return null;
};

export default PageTitle ;
PageTitle.defaultProps = {
  title: "",
};
PageTitle.propTypes = {
  title: PropTypes.string,
};