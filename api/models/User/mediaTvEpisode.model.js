const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mediaTvEpisodeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mediaId: { type: String, required: true },
    media_type: { type: String, required: true },
    season: { type: String, required: true },
    idEpisode: { type: String, required: true },
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
      default: null,
    },
    runtime: {
      type: Number,
    },
    vote: {
      type: Number,
      default: -1,
      get: (v) => {
        // Getter function to convert database value to double format if necessary
        return parseFloat(v);
      },
      set: (v) => {
        // Setter function to convert the value to Number before saving it in the database.
        return parseFloat(v);
      },
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

const MediaTvEpisode = mongoose.model("MediaTvEpisode", mediaTvEpisodeSchema);
module.exports = MediaTvEpisode;
