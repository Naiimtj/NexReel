const yearOf = (d) => new Date(d).getFullYear();

class SortsMedias {
  constructor(data, mediaType, lang) {
    this.data = data;
    this.mediaType = mediaType;
    this.lang = lang;
  }

  getUniqueMoviesByDate() {
    if (!this.data) return [];

    const seen = new Set();
    const unique = this.data.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });

    const dateKey =
      this.mediaType === 'movie' ? 'release_date' : 'first_air_date';

    return unique.sort((a, b) => {
      if (!a[dateKey] && !b[dateKey]) return 0;
      if (!a[dateKey]) return 1;
      if (!b[dateKey]) return -1;
      return yearOf(b[dateKey]) - yearOf(a[dateKey]);
    });
  }
}

export default SortsMedias;
