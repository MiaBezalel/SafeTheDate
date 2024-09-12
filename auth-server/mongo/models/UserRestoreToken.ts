import mongoose, { Schema, Types } from "mongoose";
import User, { IUser } from "./User";

const UserRestoreTokenSchema = new mongoose.Schema<IUserRestoreToken>({
  token: {
    type: String,
    unique: true,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  // userId: { type: String, unique: true, required: true },
});

const UserRestoreToken = mongoose.model(
  "UserRestoreToken",
  UserRestoreTokenSchema
);

export interface IUserRestoreToken {
  _id: Types.ObjectId;
  token: string;
  expiryDate: Date;
  user: IUser;
  // userId: string
}
export default UserRestoreToken;
