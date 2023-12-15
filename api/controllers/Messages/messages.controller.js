const createError = require("http-errors");
const Message = require("../../models/Message/message.model");
const Forum = require("../../models/Forum/forum.model");
const User = require("../../models/User/user.model");

module.exports.create = ({ mode }) => {
  return async (req, res, next) => {
    const { textMessage } = req.body;
    const criterial = { textMessage };
    switch (mode) {
      case "forum":
        criterial.sender = req.user.id;
        criterial.forum = req.params.forumId;
        try {
          const findForum = await Forum.findById(req.params.forumId);
          if (findForum) {
            await User.findByIdAndUpdate(findForum.author, {
              notificationsRead: true,
            });
          }
        } catch (error) {
          next(error);
        }
        break;
      case "user":
        criterial.sender = req.user.id;
        criterial.receiver = req.params.userId;
        try {
          await User.findByIdAndUpdate(req.params.userId, {
            notificationsRead: true,
          });
        } catch (error) {
          next(error);
        }
        break;
      default:
        next(createError(404, "Invalid mode specified"));
        break;
    }
    try {
      const message = await Message.create(criterial);

      if (!message) {
        return next(createError(404, "Message not found"));
      }
      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  };
};

module.exports.detail = ({ mode }) => {
  return async (req, res, next) => {
    const criterial = {};
    switch (mode) {
      case "forum":
        criterial.forum = req.params.forumId;
        criterial._id = req.params.id;
        break;
      case "user":
        criterial.sender = req.user.id;
        criterial.receiver = req.params.userId;
        criterial._id = req.params.id;
        break;
      default:
        next(createError(404, "Invalid mode specified"));
        break;
    }
    try {
      const message = await Message.findOne(criterial);

      if (!message) {
        return next(createError(404, "Message not found"));
      }
      res.status(200).json(message);
    } catch (error) {
      if (
        (error.name === "CastError" && error.path === "receiver") ||
        (error.name === "CastError" && error.path === "forum")
      ) {
        next(createError(404, `'${mode}Id' not found`));
      } else {
        next(error);
      }
    }
  };
};

module.exports.list = ({ mode }) => {
  return async (req, res, next) => {
    const criterial = {};
    switch (mode) {
      case "forum":
        criterial.forum = req.params.forumId;
        break;
      case "user":
        criterial.$or = [
          { sender: req.user.id, receiver: req.params.userId },
          { sender: req.params.userId, receiver: req.user.id },
        ];
        break;
      default:
        break;
    }
    try {
      const messages = await Message.find(criterial)
        .populate("userSender", "username")
        .populate("userReceiver", "username");

      if (!messages || messages.length === 0) {
        return next(createError(404, "Message not found"));
      }
      res.status(200).json(messages);
    } catch (error) {
      next(error);
    }
  };
};

module.exports.update = async (req, res, next) => {
  const { textMessage } = req.body;

  try {
    const message = await req.message;
    if (message) {
      const updateMessage = await Message.findByIdAndUpdate(
        message.id,
        { textMessage, edited: true },
        {
          runValidators: true,
          new: true,
        }
      );

      if (!updateMessage) {
        return next(createError(404, "Message not found"));
      }

      res.status(200).json(updateMessage);
    }
  } catch (error) {
    next(error);
  }
};

module.exports.delete = async (req, res, next) => {
  try {
    const message = await req.message;

    if (!message) {
      return next(createError(404, "Message not found"));
    }
    const deletedMessage = await Message.findByIdAndDelete(message.id);

    if (!deletedMessage) {
      return next(createError(404, "Message not found"));
    }

    res.status(204).json({ result: true });
  } catch (error) {
    next(error);
  }
};
