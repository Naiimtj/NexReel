const createError = require("http-errors");
const { ADMIN_ROLE } = require("../constants");
const MediaTvEpisode = require("../models/User/mediaTvEpisode.model");

module.exports.exists = async (req, res, next) => {
  const media = await MediaTvEpisode.findOne({mediaId: req.params.id, userId: req.user.id});
  if (media) {
    req.media = media;
    next();
  } else {
    next(createError(404, "Media not found"));
  }
};

module.exports.isOwnerOrAdmin = (req, res, next) => {
  const { id, role } = req.user;
  const { userId } = req.media;

  if (id === userId.toString() || role >= ADMIN_ROLE) {
    next();
  } else {
    next(createError(403, "Forbidden"));
  }
};
