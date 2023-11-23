const createError = require("http-errors");
const { ADMIN_ROLE } = require("../constants");
const Messages = require("../models/Message/message.model");

module.exports.exists = async (req, res, next) => {
  const message = await Messages.findById(req.params.id);
  if (message) {
    req.message = message;
    next();
  } else {
    next(createError(404, "Message not found"));
  }
};

module.exports.isOwnerOrAdmin = (req, res, next) => {
  const { id, role } = req.user;
  const { sender } = req.message;
  if (id === sender.toString() || role >= ADMIN_ROLE) {
    next();
  } else {
    next(createError(403, "Forbidden"));
  }
};
