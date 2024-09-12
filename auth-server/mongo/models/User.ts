import mongoose, { Schema, Types } from "mongoose"
import { IRefreshToken } from "./RefreshToken"
import { IUserConfirmation } from "./UserConfirmation"

const UserSchema = new mongoose.Schema<IUser>({
  username: { type: String, required: true },
  password: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  refreshToken: {
    type: Schema.Types.ObjectId,
    ref: "RefreshToken",
  },
  isConfirmed: { type: Boolean, default: false },
  userConfirmation: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: "UserConfirmation",
  },
  credit: { type: Number, default: 0, required: false },
})

const User = mongoose.model("User", UserSchema)
export interface IUser {
  _id: Types.ObjectId
  username: string
  password: string
  email: string
  firstName: string
  lastName: string
  refreshToken: Types.ObjectId
  isConfirmed: boolean
  userConfirmation: Types.ObjectId
  image: string,
  credit: number
}

export default User
