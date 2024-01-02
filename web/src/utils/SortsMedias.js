function yearDate(date_media) {
  const date = new Date(date_media).getFullYear();
  return date;
}

class SortsMedias {
  constructor(data, mediaType, lang) {
    this.data = data; // string
    this.mediaType = mediaType; // string
    this.lang = lang; // t of useTranslation !Important for translation
  }

  getUniqueMoviesByDate() {
    const uniqueMediaMap = new Map(); // Map to track unique IDs
    const uniqueMedias = []; // List to store unique movies

    if (this.data) {
      this.data.forEach((media) => {
        if (!uniqueMediaMap.has(media.id)) {
          uniqueMediaMap.set(media.id, true); // Store the ID in the Map
          uniqueMedias.push(media); // Add the movie to the unique list
        }
      });
      const dateText =
        this.mediaType === "movie" ? "release_date" : "first_air_date";
      uniqueMedias.sort(function (a, b) {
        if (a[dateText] === "" && b[dateText] === "") {
          return 0; // If both have no date, their order remains unchanged
        } else if (a[dateText] === "") {
          return 1; // If only 'a' has no date, it goes to the end
        } else if (b[dateText] === "") {
          return -1; // If only 'b' has no date, 'a' goes before
        } else {
          // Both have dates, sort them normally
          if (yearDate(a[dateText]) < yearDate(b[dateText])) {
            return 1;
          }
          if (yearDate(a[dateText]) > yearDate(b[dateText])) {
            return -1;
          }
          return 0;
        }
      });
    }

    return uniqueMedias;
  }
}

export default SortsMedias;
