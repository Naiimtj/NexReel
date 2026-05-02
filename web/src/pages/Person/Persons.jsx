import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  getMediaDetails,
  getMediaDetailsEN,
  getPersonDetails,
} from '../../../services/TMDB/services-tmdb';
import PersonDetails from '../../components/Persons/PersonDetails';
import Spinner from '../../utils/Spinner/Spinner';

const Persons = () => {
  const [t] = useTranslation('translation');
  const { media_type, id, idMedia } = useParams();
  const [persona, setPersona] = useState({});
  const [personaEN, setPersonaEN] = useState({});
  const [filmsPerson, setFilmsPerson] = useState({});
  const [detailsMedia, setDetailsMedia] = useState([]);

  useEffect(() => {
    if (!idMedia || !media_type) return;
    getMediaDetails(media_type, idMedia, t('es-ES')).then((result) => {
      if (Object.keys(result).length > 0) setDetailsMedia(result);
    });
  }, [idMedia, media_type, t]);

  useEffect(() => {
    if (!id) return;
    getMediaDetails('person', id, t('es-ES')).then(setPersona);
    getMediaDetailsEN('person', id).then(setPersonaEN);
    getPersonDetails('person', id, t('es-ES')).then(setFilmsPerson);
  }, [t, id]);

  const ready =
    Object.keys(filmsPerson).length > 0 &&
    (Object.keys(persona).length > 0 || Object.keys(personaEN).length > 0);

  if (!ready) return <Spinner result />;

  return (
    <div className="rounded-3xl bg-contain bg-center bg-fixed w-auto h-auto mt-6">
      <div className="text-gray-200 w-auto bg-local object-cover backdrop-blur-md bg-transparent/30 rounded-3xl px-4 pb-4">
        <PersonDetails
          info={persona}
          infoEN={personaEN}
          films={filmsPerson}
          media={media_type}
          idMedia={idMedia}
          titleMedia={detailsMedia.title ?? detailsMedia.name}
        />
      </div>
    </div>
  );
};

export default Persons;
