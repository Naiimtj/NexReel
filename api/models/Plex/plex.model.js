const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const plexSchema = new Schema(
  {   
    movie: {
      type: Array,
    },
    tv: {
      type: Array,
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

const PlexData = mongoose.model("PlexData", plexSchema);
module.exports = PlexData;
