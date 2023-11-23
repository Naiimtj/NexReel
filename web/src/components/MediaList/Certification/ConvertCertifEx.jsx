import PropTypes from "prop-types";
// Consulting https://en.wikipedia.org/wiki/Motion_picture_content_rating_system

function ConvertCertifEx({ info, media }) {
  const processInfo = {
    country: "País de la calificación",
    calification: "La calificación",
    calificationFinal: "El final tras filtrar país",
  };

  if (media === "tv") {
    processInfo.country = info ? info.iso_3166_1 : null;

    processInfo.calification =
      info && info !== undefined && media === "movie"
        ? info.rating
        : info.release_dates;
    const tvCalifFinal = {
      US: {
        NR: null,
        "TV-Y": "TP",
        "TV-Y7": "+7",
        "TV-G": "+10",
        "TV-PG": "+12",
        "TV-14": "+14",
        "TV-MA": "+18",
      },
      RU: {
        "0+": "TP",
        "6+": "+7",
        "12+": "+12",
        14: "+14",
        "16+": "+16",
        "18+": "+18",
      },
      CA: {
        Exempt: null,
        C: "TP",
        C8: "+7",
        G: "+12",
        PG: "+14",
        "14+": "+16",
        "18+": "+18",
      },
      AU: {
        G: "TP",
        P: "+10",
        C: "+12",
        "MA15+": "+14",
        "AV15+": "+16",
        "R18+": "+18",
      },
      FR: { NR: null, 10: "+10", 12: "+12", 16: "+16", 18: "+18" },
      DE: { 0: "TP", 6: "+7", 12: "+12", 16: "+16", 18: "+18" },
      TH: {
        "-": null,
        ส: "TP",
        ท: "TP",
        12: "+12",
        "น 13+": "+14",
        "น 15+": "+16",
        "น 18+": "+18",
        "ฉ 20-": "+18",
      },
      KR: {
        Exempt: null,
        ALL: "TP",
        7: "+7",
        12: "+12",
        15: "+16",
        19: "+18",
      },
      GB: {
        U: "TP",
        PG: "TP",
        "12A": "+10",
        12: "+12",
        15: "+16",
        18: "+18",
        R18: "+18",
      },
      BR: { L: "TP", 10: "+10", 12: "+12", 14: "+14", 16: "+16", 18: "+18" },
      NL: { NR: null, AL: "TP", 6: "+7", 9: "+10", 12: "+12", 16: "+16" },
      PT: {
        NR: null,
        T: "TP",
        "10AP": "+10",
        "12AP": "+12",
        16: "+16",
        18: "+18",
      },
      "CA-QC": {
        NR: null,
        G: "TP",
        "8+": "+7",
        "13+": "+14",
        "16+": "+16",
        "18+": "+18",
      },
      HU: {
        NR: null,
        Unrated: "TP",
        6: "+7",
        12: "+12",
        14: "+14",
        16: "+16",
        18: "+18",
      },
      LT: { NR: null, L: "TP", "N-7": "+7", "N-14": "+14", S: "+18" },
      PH: { NR: null, G: "TP", PG: "+7", SPG: "+14", X: "+18" },
      ES: {
        NR: null,
        Infantil: "TP",
        TP: "TP",
        7: "+7",
        10: "+10",
        12: "+12",
        13: "+14",
        16: "+16",
        18: "+18",
      },
      SK: { NR: null, 7: "+7", 12: "+12", 15: "+14", 18: "+18" },
    };
    processInfo.calificationFinal =
      tvCalifFinal[processInfo.country][processInfo.calification] || null;
  } else if (media === "movie") {
    processInfo.country = info && info.iso_3166_1;

    const movieCalifFinal = {
      FR: {
        U: "TP",
        10: "+10",
        12: "+12",
        16: "+16",
        18: "+18",
      },
      JP: {
        G: "TP",
        PG12: "+12",
        "R15+": "+16",
        "R18+": "+18",
      },
      US: {
        NR: null,
        G: "TP",
        PG: "TP",
        "PG-13": "+14",
        "NC-17": "+18",
        R: "+18",
      },
      AU: {
        E: null,
        G: "TP",
        PG: "+7",
        M: "+14",
        "MA 15+": "+16",
        "R 18+": "+18",
        RC: "+18",
        "X 18+": "X18+",
      },
      FI: {
        KK: "Banned",
        S: "TP",
        "K-7": "+7",
        "TV-Y7": "+7",
        "K-12": "+12",
        "K-16": "+16",
        "K-18": "+18",
      },
      PT: {
        Públicos: "TP",
        "M/3": "TP",
        "M/6": "+7",
        10: "+10",
        "M/12": "+12",
        "M/14": "+14",
        "M/16": "+16",
        "M/18": "+18",
        P: "X18+",
      },
      "CA-QC": {
        NR: null,
        T: "TP",
        G: "TP",
        "13+": "+14",
        "16+": "+16",
        "18+": "+18",
      },
      IT: {
        NR: null,
        T: "TP",
        "6+": "+7",
        VM14: "+14",
        "14+": "+14",
        "18+": "+18",
        VM18: "+18",
      },
      CA: {
        E: null,
        G: "TP",
        PG: "+7",
        "14A": "+14",
        "18A": "+18",
        A: "X18+",
        R: "+18",
      },
      IN: {
        U: null,
        UA: "TP",
        "U/A 7+": "+7",
        "U/A 13+": "+14",
        "U/A 16+": "+16",
        A: "+18",
      },
      SE: {
        NR: null,
        Btl: "TP",
        7: "+7",
        11: "+12",
        15: "+16",
      },
      NO: {
        NR: null,
        A: "TP",
        6: "+7",
        9: "+10",
        12: "+12",
        15: "+16",
        18: "+18",
      },
      DE: {
        0: "TP",
        6: "+7",
        12: "+12",
        16: "+16",
        18: "+18",
      },
      MY: {
        NR: null,
        U: "TP",
        P13: "+14",
        "18SG": "+16",
        "18PA": "+18",
        "18PL": "X18+",
        "18SX": "X18+",
      },
      PH: {
        NR: null,
        G: "TP",
        PG: "+7",
        "R-13": "+14",
        "R-16": "+16",
        "R-18": "+18",
        X: "X18+",
      },
      NL: {
        AL: "TP",
        6: "+7",
        9: "+10",
        14: "+14",
        12: "+12",
        16: "+16",
        18: "+18",
      },
      BG: {
        B: "TP",
        A: "TP",
        C: "+12",
        D: "+16",
        X: "+18",
      },
      HU: {
        NR: null,
        KN: "TP",
        6: "+7",
        12: "+12",
        16: "+16",
        18: "+18",
        X: "X18+",
      },
      NZ: {
        G: "TP",
        PG: "+7",
        R13: "+14",
        RP13: "+14",
        RP16: "+16",
        RP18: "+18",
        R15: "+15",
        R16: "+16",
        R18: "+18",
        13: "+14",
        15: "+16",
        M: "+16",
        16: "+16",
        18: "+18",
        R: "+18",
      },
      DK: {
        NR: null,
        A: "TP",
        7: "+7",
        11: "+12",
        15: "+16",
        F: "+18",
      },
      LT: {
        NR: null,
        V: "TP",
        "N-7": "+7",
        "N-13": "+14",
        "N-16": "+16",
        "N-18": "+18",
      },
      GB: {
        U: "TP",
        PG: "+7",
        "12A": "+12",
        12: "+14",
        15: "+16",
        18: "+18",
        R18: "X18+",
      },
      BR: {
        L: "TP",
        10: "+10",
        12: "+12",
        14: "+14",
        16: "+16",
        18: "+18",
      },
      RU: {
        NR: null,
        "0+": "TP",
        "6+": "+7",
        "12+": "+14",
        "16+": "+16",
        "18+": "+18",
      },
      KR: {
        All: "TP",
        12: "+12",
        15: "+16",
        18: "+18",
        "Restricted Screening": "X18+",
      },
      SK: {
        U: "TP",
        7: "+7",
        12: "+12",
        15: "+16",
        18: "+18",
      },
      TH: {
        P: "TP",
        G: "TP",
        13: "+14",
        15: "+16",
        18: "+18",
        20: "X18+",
        Banned: "Banned",
      },
      MX: {
        A: "TP",
        AA: "+7",
        B: "+12",
        "B-15": "+16",
        C: "+18",
        D: "X18+",
      },
      ID: {
        SU: "TP",
        "13+": "+14",
        "17+": "+16",
        "21+": "+18",
      },
      TR: {
        "Genel İzleyici Kitlesi": "TP",
        "6A": "+7",
        "6+": "+7",
        "10A": "+10",
        10: "+10",
        "13A": "+14",
        "13+": "+14",
        "16+": "+16",
        "18+": "+18",
      },
      AR: {
        ATP: "TP",
        "+13": "+12",
        "+16": "+16",
        "+18": "+18",
        C: "X18+",
      },
      GR: {
        K: "TP",
        K12: "+12",
        K15: "+16",
        K18: "+18",
      },
      TW: {
        "0+": "TP",
        "6+": "+7",
        "12+": "+12",
        "15+": "+16",
        "18+": "+18",
      },
      ZA: {
        A: "TP",
        PG: "TP",
        7: "+7",
        "7-9PG": "+7",
        "10-12PG": "+12",
        13: "+14",
        16: "+16",
        18: "+18",
        X18: "X18+",
        XX: "X18+",
      },
      SG: {
        G: "TP",
        PG: "TP",
        PG13: "+15",
        NC16: "+18",
        M18: "+18",
        R21: "X18+",
      },
      IE: {
        G: "TP",
        PG: "+7",
        "12A": "+12",
        12: "+12",
        15: "+16",
        "15A": "+16",
        16: "+16",
        18: "+18",
        X: "X18+",
      },
      PR: {
        NR: null,
        G: "TP",
        PG: "TP",
        "PG-13": "+12",
        "NC-17": "+16",
        R: "+18",
      },
      VI: {
        NR: null,
        G: "TP",
        PG: "TP",
        "PG-13": "+12",
        "NC-17": "+18",
        R: "+18",
      },
      ES: {
        A: "TP",
        Ai: "TP",
        APTA: "TP",
        7: "+7",
        "7i": "+7",
        12: "+12",
        16: "+16",
        18: "+18",
        X: "X18+",
      },
      CH: {
        0: "TP",
        6: "+7",
        8: "+7",
        10: "+7",
        12: "+12",
        14: "+16",
        16: "+16",
        18: "+18",
      },
      IL: {
        All: "TP",
        12: "+12",
        14: "+14",
        16: "+16",
        18: "+18",
      },
      HK: {
        I: "TP",
        IIA: "+12",
        IIB: "+16",
        III: "+18",
      },
      MO: {
        A: "TP",
        B: "+7",
        C: "+16",
        D: "+18",
      },
      LV: {
        U: "TP",
        "7+": "+7",
        "12+": "+12",
        "16+": "+16",
        "18+": "+18",
      },
      LU: {
        EA: "TP",
        6: "+7",
        12: "+12",
        16: "+16",
        18: "+18",
      },
      CZ: {
        UR: null,
        U: "TP",
        "12+": "+12",
        "15+": "+16",
        "18+": "+18",
      },
    };
    console.log();
    processInfo.calif =
      info && info.release_dates[0]
        ? info.release_dates[0].certification
        : null;

    if (info && info.release_dates && info.release_dates.length > 1) {
      const sortedMedia = info.release_dates.filter(
        (nulos) => nulos.certification !== ""
      );
      sortedMedia.sort((a, b) =>
        a.type < b.type ? 1 : a.type > b.type ? -1 : 0
      );
      processInfo.calification = sortedMedia[0].certification;
    } else {
      processInfo.calification = processInfo.calif;
    }
    processInfo.calificationFinal =
      (movieCalifFinal[processInfo.country] &&
        movieCalifFinal[processInfo.country][processInfo.calification]) ||
      processInfo.calification;
  }

  return (
    <div
      className={
        processInfo.calificationFinal
          ? "text-xs text-center text-gray-400 border-2 border-gray-600"
          : ""
      }
    >
      {processInfo.calificationFinal}
    </div>
  );
}

export default ConvertCertifEx;

ConvertCertifEx.defaultProps = {
  info: {},
  media: "",
};

ConvertCertifEx.propTypes = {
  info: PropTypes.object,
  media: PropTypes.string,
};
