const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const forumSchema = new Schema(
  {
    title: {
      type: String,
      required: "Title forum is required",
      minLength: [3, "Title must be at least 3 characters long"],
    },
    tags: { type: Array },
    shortDescription: {
      type: String,
      maxLength: [40, "Short description can't be longer than 40 characters"],
    },
    description: {
      type: String,
    },
    imgForum: {
      type: String,
    },
    medias: { type: Array },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

forumSchema.virtual("userCreate", {
  ref: "User",
  localField: "author",
  foreignField: "_id",
});

forumSchema.virtual("followers", {
  ref: "ForumFollowers",
  localField: "_id",
  foreignField: "forumId",
});

const Forum = mongoose.model("Forum", forumSchema);
module.exports = Forum;
