const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const forumFollowerSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    forumId: {
      type: Schema.Types.ObjectId,
      ref: "Forum",
      required: true,
    },
    like: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = doc._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);


const ForumFollowers = mongoose.model("ForumFollowers", forumFollowerSchema);
module.exports = ForumFollowers;
