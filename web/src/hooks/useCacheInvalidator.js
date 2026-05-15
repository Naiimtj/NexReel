import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { clearApiCache } from '../../services/DB/services-db';

/**
 * Clears the in-memory API cache whenever the route changes.
 * Must be used inside a Router context (e.g. in App).
 */
const useCacheInvalidator = () => {
  const location = useLocation();
  const prevPathname = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevPathname.current) {
      clearApiCache();
      prevPathname.current = location.pathname;
    }
  }, [location.pathname]);
};

export default useCacheInvalidator;
