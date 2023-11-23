const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mediaSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mediaId: { type: String, required: true },
    media_type: { type: String, required: true },
    like: {
      type: Boolean,
      default: null,
    },
    seen: {
      type: Boolean,
      default: null,
    },
    pending: {
      type: Boolean,
      default: false,
    },
    runtime: {
      type: Number,
    },
    vote: {
      type: Number,
      default: -1,
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

const Media = mongoose.model("Media", mediaSchema);
module.exports = Media;
