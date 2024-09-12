import mongoose, { Schema, Types } from "mongoose"
import { ObjectID } from "../../src/utils/types"
import User, { IUser } from "./User"

const UserConfirmationSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
})

const UserConfirmation = mongoose.model<IUserConfirmation>(
  "UserConfirmation",
  UserConfirmationSchema
)

export interface IUserConfirmation {
  _id: Types.ObjectId;
  // user: string;
  email: string;
}

export default UserConfirmation
