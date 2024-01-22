import PropTypes from "prop-types";
import Carousel from "../../utils/Carousel/Carousel";
import { getCollections } from "../../../services/TMDB/services-tmdb";
import { useEffect, useState } from "react";

function compareDates(a, b) {
  const dateA = new Date(a.release_date);
  const dateB = new Date(b.release_date);
  return dateA - dateB;
}

function Collections({ idCollection, media, pendingSeenMedia,
  setPendingSeenMedia }) {
  const [collectionList, setCollectionList] = useState({});
  const [isChange, isSetChange] = useState(false);

  useEffect(() => {
    if (idCollection) {
      getCollections(idCollection).then((data) => {
        setCollectionList(data);
        isSetChange(false)
    });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idCollection, pendingSeenMedia]);

  useEffect(() => {
      isSetChange(true)
  }, [pendingSeenMedia]);
  // -ORDER BY DATE
  // .Filter Repeats
  const collectionFilms =
    collectionList &&
    Object.keys(collectionList).length > 0 &&
    collectionList.parts &&
    Array.from(new Set(collectionList.parts.map((a) => a.id))).map((id) =>
      collectionList.parts.find((a) => a.id === id)
    );

  const finalCollectionFilms =
    collectionFilms &&
    collectionFilms.sort(
      compareDates
    );
  const collection = finalCollectionFilms
    ? finalCollectionFilms.filter((dateFilm) => dateFilm.release_date !== "")
    : null;

  return (
    <>
      {collection && collection.length > 1 ? (
        <div className="text-gray-200 pt-4">
          <div className="text-gray-200 px-4 md:px-6">
            <Carousel
              title={`${collectionList.name} (${collection.length})`}
              info={collection}
              media={media}
              isChange={isChange}
              isSetChange={isSetChange}
              setPendingSeenMedia={setPendingSeenMedia}
              pendingSeenMedia={pendingSeenMedia}
              isAllCards
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

export default Collections;

Collections.defaultProps = {
  idCollection: 0,
  media: "",
  setPendingSeenMedia: () => {},
  pendingSeenMedia: false,
};

Collections.propTypes = {
  idCollection: PropTypes.number,
  media: PropTypes.string,  
  setPendingSeenMedia: PropTypes.func,
  pendingSeenMedia: PropTypes.bool,
};
