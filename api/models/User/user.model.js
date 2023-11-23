const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const WORK_FACTOR = 10;

const EMAIL_PATTERN =
  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: "User email is required",
      lowercase: true,
      trim: true,
      unique: true,
      match: [EMAIL_PATTERN, "Invalid email format"],
    },
    username: {
      type: String,
      required: "UserName is required",
      lowercase: true,
      trim: true,
      unique: true,
      validate: {
        validator: function (value) {
          return !value.includes(" ");
        },
        message: "UserName can not contain white spaces",
      },
      minLength: [3, "UserName needs at least 3 chars"],
    },
    password: {
      type: String,
      required: "User password is required",
      minLength: [8, "User password must be at least 8 characters long"],
    },
    region: {
      type: String,
      required: "Region is required",
      uppercase: true,
    },
    favoritePhrase: {
      type: String,
      default: null,
      maxLength: [
        20,
        "Your favorite phrase cannot be longer than 20 characters",
      ],
    },
    role: {
      type: Number,
    },
    genresLike: {
      type: Array,
    },
    genresUnLike: {
      type: Array,
    },
    avatarURL: {
      type: String,
    },
    playlistsFollow: {
      type: Array,
    },
    notificationsRead: {
      type: Boolean,
      default: false,
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
        delete ret.password;
        return ret;
      },
    },
  }
);

userSchema.virtual("medias", {
  ref: "Media",
  localField: "_id",
  foreignField: "userId",
});

userSchema.virtual("playlists", {
  ref: "Playlist",
  localField: "_id",
  foreignField: "author",
});

userSchema.virtual("followers", {
  ref: "UserFollowers",
  localField: "_id",
  foreignField: "UserIDFollowing",
});

userSchema.virtual("following", {
  ref: "UserFollowers",
  localField: "_id",
  foreignField: "UserIDFollower",
});

userSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    bcrypt
      .hash(this.password, WORK_FACTOR)
      .then((hash) => {
        this.password = hash;
        next();
      })
      .catch((error) => next(error));
  } else {
    next();
  }
});

userSchema.methods.checkPassword = function (passwordToCheck) {
  return bcrypt.compare(passwordToCheck, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
