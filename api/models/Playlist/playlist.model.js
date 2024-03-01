const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const playlistSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: "Title Playlist is required",
      trim: true,
      minLength: [3, "Title needs at least 3 chars"],
      maxLength: [40, "Your title can not be longer than 40 characters"],
    },
    description: {
      type: String,
    },
    imgPlaylist: {
      type: String,
    },
    tags: { type: Array },
    medias: { type: Array },
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

playlistSchema.virtual("user", {
  ref: "User",
  localField: "author",
  foreignField: "_id",
});

playlistSchema.virtual("followersPlaylist", {
  ref: "PlaylistFollowers",
  localField: "_id",
  foreignField: "playlistId",
});

const Playlist = mongoose.model("Playlist", playlistSchema);
module.exports = Playlist;
