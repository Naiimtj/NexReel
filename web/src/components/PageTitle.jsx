import { useEffect } from 'react';

const PageTitle  = ({ title = "" }) => {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return null;
};

export default PageTitle ;
