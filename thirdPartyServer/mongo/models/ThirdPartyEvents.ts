import { Schema, model, Document, Model, Types } from "mongoose";

interface ThirdPartyEventsSchemaMongoType {
  name: string;
  location: string;
  timeAndDate: Date;
  type: string;
  ticketsAmount: number;
  image: string;
  ownerId: Types.ObjectId;
  ticketPrice: number;
  description: string;
}

// Define Mongoose schema for Event
const thirdPartyEventsSchema = new Schema<ThirdPartyEventsSchemaMongoType>({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  location: {
    type: String,
    required: true,
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
export const ThirdPartyEvents: Model<ThirdPartyEventsSchemaMongoType> = model(
  "thirdPartyEvents",
  thirdPartyEventsSchema
);
