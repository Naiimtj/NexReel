const createError = require("http-errors");
const { ADMIN_ROLE } = require("../constants");
const MediaTvSeason = require("../models/User/mediaTvSeason.model");
const Media = require("../models/User/media.model");

module.exports.exists = async (req, res, next) => {
  const mediaTvSeason = await MediaTvSeason.findOne({
    mediaId: req.params.mediaId,
    userId: req.user.id,
    season: req.params.season,
  });
  if (mediaTvSeason) {
    req.media = mediaTvSeason;
    next();
  } else {
    const media = await Media.findOne({
      mediaId: req.params.mediaId,
      userId: req.user.id,
    });
    if (media) {
      const mediaSeason = {
        ...media.toObject(),
        season: req.params.season,
        runtime: media.runtime_seasons[req.params.season],
      };
      delete mediaSeason.seenComplete;
      delete mediaSeason.runtime_seen;
      req.media = mediaSeason;
      next();
    } else {
      next(createError(404, "Media not found"));
    }
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
