const createError = require("http-errors");
const { ADMIN_ROLE } = require("../constants");
const Playlists = require("../models/Playlist/playlist.model");

module.exports.exists = async (req, res, next) => {
  const playlist = await Playlists.findById(req.params.id);
  if (playlist) {
    req.playlist = playlist;
    next();
  } else {
    next(createError(404, "Playlist not found"));
  }
};

module.exports.isOwnerOrAdmin = (req, res, next) => {
  const { id, role } = req.user;
  const { author } = req.playlist;
  if (id === author.toString() || role >= ADMIN_ROLE) {
    next();
  } else {
    next(createError(403, "Forbidden"));
  }
};
