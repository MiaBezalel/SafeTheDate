import { Schema, model, Document, Model, Types } from "mongoose";

interface ThirdPartyTicketsMongoType {
  barcode: string;
  price: number;
  eventId: Types.ObjectId;
  ownerId: Types.ObjectId;
}
// Define Mongoose schema for Event
const thirdPartyTicketsSchema = new Schema<ThirdPartyTicketsMongoType>({
  barcode: { type: String, unique: true, required: true },
  price: {
    type: Number,
    required: true,
  },
  eventId: {
    type: Schema.Types.ObjectId,
    ref: "thirdPartyEvents",
    required: true,
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
});

// Create Mongoose model for Event
export const ThirdPartyTickets: Model<ThirdPartyTicketsMongoType> = model(
  "thirdPartyTickets",
  thirdPartyTicketsSchema
);
