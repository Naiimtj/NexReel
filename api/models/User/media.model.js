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
      default: false,
    },
    seen: {
      type: Boolean,
      default: false,
    },
    pending: {
      type: Boolean,
      default: false,
    },
    seenComplete: {
      type: Boolean,
      default: false,
    },    
    runtime: {
      type: Number,
    },
    number_seasons: { type: Number },
    number_of_episodes: { type: Number },
    runtime_seen: {type: Number },
    runtime_seasons: {type: Array },
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

const Media = mongoose.model("Media", mediaSchema);
module.exports = Media;
