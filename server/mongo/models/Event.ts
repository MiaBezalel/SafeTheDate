import { Schema, model, Document, Model, Types } from "mongoose";

interface EventMongoType {
  name: string;
  location: string;
  timeAndDate: Date;
  ownerId: Types.ObjectId;
  type: string;
  ticketsAmount: number;
  ticketPrice: number;
  description: string;
  image: string;
  isExternal: boolean;
}

// Define Mongoose schema for Event
const eventSchema = new Schema<EventMongoType>({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  isExternal: {
    type: Boolean,
    required: true,
    default: false,
  },
  timeAndDate: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  ticketsAmount: {
    type: Number,
    required: true,
  },
  ticketPrice: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
});

// Create Mongoose model for Event
export const Event: Model<EventMongoType> = model("Event", eventSchema);
