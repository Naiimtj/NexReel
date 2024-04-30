module.exports = {
  users: require("./Users/users.controller"),
  medias: require("./Users/medias.controller"),
  media: require("./Media/media.controller"),
  mediaTvSeason: require("./Users/mediasTvSeason.controller"),
  mediaTvEpisode: require("./Users/mediasTvEpisode.controller"),
  playlists: require("./Playlists/playlists.controller"),
  messages: require("./Messages/messages.controller"),
  forums: require("./Forums/forums.controller"),
  plex: require("./Plex/plex.controller"),
};
