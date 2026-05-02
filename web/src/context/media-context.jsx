/* eslint-disable react/prop-types */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { getAllMedia } from '../../services/DB/services-db';
import { useAuthContext } from './auth-context';

const MediaContext = createContext();

export function MediaProvider({ children }) {
  const { user } = useAuthContext();
  const [mediasUser, setMediasUser] = useState([]);

  const refreshMedias = useCallback(() => {
    getAllMedia()
      .then((data) => setMediasUser(data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      refreshMedias();
    } else {
      setMediasUser([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <MediaContext.Provider value={{ mediasUser, refreshMedias }}>
      {children}
    </MediaContext.Provider>
  );
}

export function useMediaContext() {
  return useContext(MediaContext);
}
