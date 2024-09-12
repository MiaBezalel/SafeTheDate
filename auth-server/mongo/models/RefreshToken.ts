import mongoose, { Schema, Types } from "mongoose"
import User, { IUser } from "./User"

const RefreshTokenSchema = new mongoose.Schema<IRefreshToken>({
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
})

const RefreshToken = mongoose.model("RefreshToken", RefreshTokenSchema)

export interface IRefreshToken {
  _id: Types.ObjectId
  token: string
  expiryDate: Date
  user: IUser
  // userId: string
}
export default RefreshToken
