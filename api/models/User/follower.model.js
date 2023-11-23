const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userFollowerSchema = new Schema(
  {
    UserIDFollower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    UserIDFollowing: {
      type: Schema.Types.ObjectId,
      ref: "UserFollowing",
      required: true,
    },
    UserConfirm: { type: Boolean, default: false },
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
userFollowerSchema.virtual("user", {
  ref: "User",
  localField: "UserIDFollower",
  foreignField: "_id",
});

const UserFollowers = mongoose.model("UserFollowers", userFollowerSchema);
module.exports = UserFollowers;
