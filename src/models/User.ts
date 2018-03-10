import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";
import { secret } from "../config";
import { Document, Schema, Model, model } from "mongoose";

const uniqueValidator = require("mongoose-unique-validator");

export interface IUser {
  username: string;
  email: string;
  token: string;
  bio: string;
  image: string;
}

export interface IUserModel extends Document {
}

export const UserSchema = new Schema(
  {
    username: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z0-9]+$/, "is invalid"],
      index: true
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/\S+@\S+\.\S+/, "is invalid"],
      index: true
    },
    bio: String,
    image: String,
    hash: String,
    salt: String
  },
  { timestamps: true }
);

UserSchema.plugin(uniqueValidator, { message: "is already taken." });

UserSchema.methods.setPassword = function(password: string) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
};

UserSchema.methods.validPassword = function(password: string) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
  return this.hash === hash;
};

UserSchema.methods.generateJWT = function(): string {
  const today = new Date();
  const exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      exp: parseInt(exp.getTime() / 1000 + "", 10)
    },
    secret
  );
};

UserSchema.methods.toAuthJSON = function(): IUser {
  return {
    username: this.username,
    email: this.email,
    token: this.generateJWT(),
    bio: this.bio,
    image: this.image
  };
};

export const User: Model<IUserModel> = model<IUserModel>("User", UserSchema);
