const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
// const moment = require("moment-timezone");

/**
 * default
 * type
 * unqiue
 * validators
 *  built-in: required, minLength, maxLength, min, max, enum, ...
 *  3rd party: validator for strings
 *  custom: validate
 */

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Please provide your name"],
    minLength: [10, "User name must have greater than or equal 10 characters"],
    maxLength: [50, "User name must have less than or equal 50 characters"],
    validate: {
      message: "Name must conatin only alphabetes",
      validator: function (val) {
        return val.match(/^[a-zA-Z ]+$/g);
      },
    },
  },
  // how to suggest an email on user
  email: {
    type: String,
    lowercase: true,
    trim: true,
    unique: true,
    required: [true, "Please provide an email"],
    validate: [
      validator.isEmail,
      "Please provide valid email i.e. (sample@example.com)",
    ],
  },
  photo: String,
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: [8, "Password length must be above 8"],
    select: false, // For remove this field from reading query
    // validate: {
    //   message: "",
    //   validator: function (val) {
    //     // return ;
    //     // val.includes()
    //   },
    // },
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    select: false,
    // WARNING: this is not valid in update case
    validate: {
      message: "Passwords are not the same!",
      validator: function (val) {
        return val === this.password;
      },
    },
  },
  passwordChangedAt: {
    type: Date,
    // select: false,
  },
  oldPassword: {
    type: String,
    select: false,
  },
  role: {
    type: String,
    default: "user",
    enum: {
      values: ["user", "admin", "tour-guide"],
      message: "Don't have access this permission.",
    },
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

// Encrypt the password pre-save the document, Never don't have to save password as plain text due to save it from hacks
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
    // delete passwordConfirm, beacause there is no benefit for remaining
    // it is only used for equality validation with password field
    this.passwordConfirm = undefined;
  }
  next();
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    // const dateTz = moment.tz(Date.now(), "Africa/Cairo");
    this.passwordChangedAt = Date.now() - 1000;
  }
  next();
});

userSchema.pre(/^find/, function(next) {
  this.find({ active: true});
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

/** Check if user changes password after  */
userSchema.methods.changedPasswordAfter = function (JwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedPasswordTime = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    console.log(changedPasswordTime, JwtTimestamp);
    return changedPasswordTime > JwtTimestamp;
  }
  return false;
};

userSchema.methods.createResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
}

const User = mongoose.model("User", userSchema);

module.exports = User;
