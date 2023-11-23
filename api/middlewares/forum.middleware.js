const createError = require("http-errors");
const { ADMIN_ROLE } = require("../constants");
const Forums = require("../models/Forum/forum.model");

module.exports.exists = async (req, res, next) => {
  const forum = await Forums.findById(req.params.id);
  if (forum) {
    req.forum = forum;
    next();
  } else {
    next(createError(404, "Forum not found"));
  }
};

module.exports.isOwnerOrAdmin = (req, res, next) => {
  const { id, role } = req.user;
  const { author } = req.forum;
  if (id === author.toString() || role >= ADMIN_ROLE) {
    next();
  } else {
    next(createError(403, "Forbidden"));
  }
};
