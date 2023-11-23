import { useEffect, useState } from "react";
import PropTypes from "prop-types";
// service
import { getRelease } from "../../../../services/TMDB/services-tmdb";
// components/utils
import ConvertCertifEx from "./ConvertCertifEx";

function Certification({ media, id, info, lang }) {
  const [loading, setLoading] = useState(true);
  const [ReleaseData, setReleaseData] = useState([]);
  useEffect(() => {
    if ((lang, media)) {
      getRelease(media, id, lang).then((data) => {
        setReleaseData(data.results);
        setLoading(false);
      });
    }
  }, [lang, id, media]);
  const releaseFiltnullos =
    media === "tv"
      ? ReleaseData &&
        ReleaseData.map((relea) => [
          {
            iso: relea.iso_3166_1,
            release: relea.rating,
          },
        ])
      : ReleaseData &&
        ReleaseData.map((relea) => [
          {
            iso: relea.iso_3166_1,
            release: relea.release_dates.filter((i) => i.certification !== ""),
          },
        ]).reduce((acc, cur) => [...acc, ...Object.values(cur)], []);
  // -FILTER 2 (If it was produced by more than one country)
  const CountriesWithRelease =
    info && info.length > 0
      ? releaseFiltnullos &&
        releaseFiltnullos.filter(
          (relea) => relea.release && relea.release.length > 0
        )
      : null;

  const listCountry =
    info && info.length > 0
      ? CountriesWithRelease &&
        CountriesWithRelease.map((relea) => {
          const findSameCountry =
            relea.release && relea.release.length > 0
              ? info.find((inf) => {
                  return (
                    (media === "movie" ? inf.iso_3166_1 : inf) === relea.iso
                  );
                })
              : null;
          return findSameCountry ? relea : null;
        }).filter((f) => f !== null)
      : null;
  const CountryFinal =
    listCountry.length > 0
      ? listCountry[0] && {
          iso_3166_1: listCountry[0].iso,
          release_dates: listCountry[0].release,
        }
      : CountriesWithRelease[0] && {
          iso_3166_1: CountriesWithRelease[0].iso,
          release_dates: CountriesWithRelease[0].release,
        };
  const converDataReleaseFillNull = releaseFiltnullos &&
    releaseFiltnullos[0] && {
      iso_3166_1: releaseFiltnullos[0].iso,
      release_dates: releaseFiltnullos[0].release,
    };
  const listFinal =
    listCountry && CountryFinal && CountryFinal.length !== 0
      ? CountryFinal
      : converDataReleaseFillNull && converDataReleaseFillNull[0];
  const checkCertification = listFinal && Object.keys(listFinal).length > 0;

  return (
    <div>
      {!loading && listFinal && checkCertification ? (
        <ConvertCertifEx info={listFinal} media={media} />
      ) : null}
    </div>
  );
}

export default Certification;

Certification.defaultProps = {
  id: 0,
  info: [],
  media: "",
  lang: "",
};

Certification.propTypes = {
  id: PropTypes.number,
  info: PropTypes.array,
  media: PropTypes.string,
  lang: PropTypes.string,
};
