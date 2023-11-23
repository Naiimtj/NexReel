const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const playlistFollowersSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    playlistId: {
      type: Schema.Types.ObjectId,
      ref: "Playlist",
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

const PlaylistFollowers = mongoose.model(
  "PlaylistFollowers",
  playlistFollowersSchema
);
module.exports = PlaylistFollowers;
