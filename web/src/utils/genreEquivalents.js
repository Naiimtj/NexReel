// TV genre id -> equivalent movie genre id(s)
export const TV_TO_MOVIE = {
  10759: ['28', '12'], // Action & Adventure -> Action / Adventure
  10765: ['878', '14'], // Sci-Fi & Fantasy -> Science Fiction / Fantasy
  10768: ['10752'], // War & Politics -> War
  10766: ['10749'], // Soap -> Romance
};

// Movie genre id -> equivalent TV genre id
export const MOVIE_TO_TV = {
  28: '10759',
  12: '10759',
  878: '10765',
  14: '10765',
  10752: '10768',
  10749: '10766',
};
