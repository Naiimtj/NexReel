const User = require("../models/User/user.model");
const createError = require("http-errors");
const { ADMIN_ROLE } = require("../constants");

module.exports.isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    User.findById(req.session.userId).then((user) => {
      if (user) {
        req.user = user;
        next();
      } else {
        next(createError(401, "Unauthorized"));
      }
    });
  } else {
    next(createError(401, "Unauthorized"));
  }
};

module.exports.isAdmin = (req, res, next) => {
  const { role } = req.user;
  if (role >= ADMIN_ROLE) {
    next();
  } else {
    next(createError(403, "Forbidden"));
  }
};

module.exports.isOwnerOrAdmin = (req, res, next) => {
  const { id, role } = req.user;
  if (id === req.params.id || role >= ADMIN_ROLE) {
    next();
  } else {
    next(createError(403, "Forbidden"));
  }
};
