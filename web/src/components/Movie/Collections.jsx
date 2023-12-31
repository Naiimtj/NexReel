import PropTypes from "prop-types";
import Carousel from "../../utils/Carousel/Carousel";
import { getCollections } from "../../../services/TMDB/services-tmdb";
import { useEffect, useState } from "react";

function compareDates(a, b) {
  const dateA = new Date(a.release_date);
  const dateB = new Date(b.release_date);
  return dateA - dateB;
}

function Collections({ idCollection, media }) {
  const [collectionList, setCollectionList] = useState({});

  useEffect(() => {
    if (idCollection) {
      getCollections(idCollection).then((data) => {
        setCollectionList(data);
      });
    }
  }, [idCollection]);
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
};

Collections.propTypes = {
  idCollection: PropTypes.number,
  media: PropTypes.string,
};
