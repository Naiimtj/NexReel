const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mediaTvFollowersSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mediaTvId: {
      type: Schema.Types.ObjectId,
      ref: "MediaTv",
      required: true,
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

const MediaTvFollowers = mongoose.model(
  "MediaTvFollowers",
  mediaTvFollowersSchema
);
module.exports = MediaTvFollowers;
