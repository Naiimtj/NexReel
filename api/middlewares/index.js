module.exports = {
  auth: require("./auth.middleware"),
  authMedia: require("./media.middleware"),
  authMediaTvSeason: require("./mediaTvSeason.middleware"),
  authMediaTvEpisode: require("./mediaTvEpisode.middleware"),
  authPlaylist: require("./playlist.middleware"),
  authMessage: require("./message.middleware"),
  authForum: require("./forum.middleware"),
};
