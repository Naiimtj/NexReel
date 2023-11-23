module.exports = {
  auth: require("./auth.middleware"),
  authMedia: require("./media.middleware"),
  authPlaylist: require("./playlist.middleware"),
  authMessage: require("./message.middleware"),
  authForum: require("./forum.middleware"),
};
