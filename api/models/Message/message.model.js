const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    forum: {
      type: Schema.Types.ObjectId,
      ref: "Forum",
    },
    textMessage: { type: String, required: true, trim: true },
    edited: {
      type: String,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = doc._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

messageSchema.virtual("userSender", {
  ref: "User",
  localField: "sender",
  foreignField: "_id",
});

messageSchema.virtual("userReceiver", {
  ref: "User",
  localField: "receiver",
  foreignField: "_id",
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
