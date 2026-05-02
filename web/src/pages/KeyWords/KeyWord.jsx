import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BsFillCaretRightFill } from 'react-icons/bs';
import { IoIosArrowBack } from 'react-icons/io';
import { useTranslation } from 'react-i18next';
import {
  getDiscoverKeywords,
  getKeywordsList,
  getMediaDetails,
} from '../../../services/TMDB/services-tmdb';
import Carousel from '../../utils/Carousel/Carousel';
import PageTitle from '../../components/PageTitle';

const KeywordSection = ({ items, media, id, idkeyword, label, type }) => {
  if (!items?.length) return null;
  return (
    <div className="pb-1 mt-4 rounded-3xl">
      <div className="flex justify-end">
        <Link
          className="flex items-center text-base text-purpleNR text-right hover:text-gray-200 mx-4 transition duration-300"
          to={`/${media}/${id}/keyword/${type}/${idkeyword}/list`}
        >
          {label.complete}
          <BsFillCaretRightFill className="align-middle" size={16} />
        </Link>
      </div>
      <Carousel title={label.title} info={items} media={type} />
    </div>
  );
};

function Keyword() {
  const [t] = useTranslation('translation');
  const { id, media_type, idkeyword } = useParams();
  const [keywordMovie, setKeywordMovie] = useState([]);
  const [keywordSerie, setKeywordSerie] = useState([]);
  const [keywordName, setKeywordName] = useState({});
  const [detallesList, setDetallesList] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!idkeyword) return;
    getDiscoverKeywords('movie', idkeyword, t('es-ES')).then((r) => {
      if (r.total_results > 0) setKeywordMovie(r.results);
    });
    getDiscoverKeywords('tv', idkeyword, t('es-ES')).then((r) => {
      if (r.total_results > 0) setKeywordSerie(r.results);
    });
    getKeywordsList(idkeyword, t('es-ES')).then((r) => {
      if (Object.keys(r).length > 0) setKeywordName(r);
    });
  }, [idkeyword, t]);

  useEffect(() => {
    if (!id || !media_type) return;
    getMediaDetails(media_type, id, t('es-ES')).then((r) => {
      if (Object.keys(r).length > 0) setDetallesList(r);
    });
  }, [id, media_type, t]);

  const backTitle = detallesList.title ?? detallesList.name;

  return (
    <div className="w-full h-full px-8 pb-5 mt-6 mb-20 text-gray-200 bg-local backdrop-blur-3xl bg-[#20283E]/80 rounded-3xl">
      <PageTitle title={`${t('Key Word')} - ${keywordName.name}`} />
      <Link
        className="ml-5 pt-5 hover:text-[#6676a7]"
        to={`/${media_type}/${id}`}
      >
        <IoIosArrowBack className="inline-block mr-1" size={25} alt="Antes" />
        {backTitle}
      </Link>
      <div className="h-full w-full p-2 md:p-4">
        <h2 className="inline-block pr-2">Palabra clave: </h2>
        <p className="inline-block capitalize font-semibold text-lg">
          {keywordName.name}
        </p>
      </div>
      <KeywordSection
        items={keywordMovie}
        media={media_type}
        id={id}
        idkeyword={idkeyword}
        type="movie"
        label={{ title: t('MOVIES'), complete: t('Complete list') }}
      />
      <KeywordSection
        items={keywordSerie}
        media={media_type}
        id={id}
        idkeyword={idkeyword}
        type="tv"
        label={{ title: t('TV SHOWS'), complete: t('Complete list') }}
      />
    </div>
  );
}

export default Keyword;
