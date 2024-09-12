import { Schema, model, Types, Model } from "mongoose"

interface UserMongoType {
  _id: Types.ObjectId
  username: string
  password: string
  email: string
  firstName: string
  lastName: string
  refreshToken: Types.ObjectId
  isConfirmed: boolean
  userConfirmation: Types.ObjectId
  credit: number, 
  image: string
}


const UserSchema = new Schema<UserMongoType>({
  username: { type: String, required: true },
  password: { type: String, required: true },
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
    ref: "UserConfirmation",
  },
  credit: { type: Number, default: 0, required: false },
  image: { type: String}
})


export const User: Model<UserMongoType> = model("User", UserSchema)
