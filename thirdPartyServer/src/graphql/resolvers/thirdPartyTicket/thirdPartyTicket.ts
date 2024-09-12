import { QueryResolvers, MutationResolvers } from "../../typeDefs";
import { ThirdPartyTickets } from "../../../../mongo/models/ThirdPartyTickets";
import { ThirdPartyEvents } from "../../../../mongo/models/ThirdPartyEvents";
import { Types } from "mongoose";

const LENGTH = 60;

function makeId() {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < LENGTH) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

const thirdPartyTicketsResolvers: {
  Query: Pick<QueryResolvers, "validateTicketAndImport">;
  Mutation: Pick<MutationResolvers, "generateTicketForCurrentEvent">;
} = {
  Query: {
    validateTicketAndImport: async (parent, args, context, info) => {
      try {
        console.log("validateTicketAndImport");
        const { id } = args;
        const ticket = await ThirdPartyTickets.findOne({
          barcode: id,
        })
          .lean()
          .then((result) => ({
            ...result,
            id: result._id.toString(),
            isSecondHand: true,
            ownerId: result.ownerId.toString(),
            eventId: result.eventId.toString(),
          }));

        if (ticket) {
          const event = await ThirdPartyEvents.findOne({
            _id: ticket?.eventId,
          })
            .lean()
            .then((event1) => ({
              ...event1,
              ownerId: event1.ownerId.toString(),
              timeAndDate: new Date(event1.timeAndDate).getTime(),
              id: event1._id.toString(),
            }));
          console.log(ticket);
          console.log(event);
          return { ticket, event };
        }
        return { ticket: {}, event: {} };
      } catch (error) {
        console.log(error);
        return { ticket: {}, event: {} };
      }
    },
  },
  Mutation: {
    generateTicketForCurrentEvent: async (parent, args, context, info) => {
      try {
        console.log("generateTicketForCurrentEvent");
        const { id, userId } = args;

        const newId = makeId(); // Generate a new qr id
        const filter = { barcode: id };
        const update = {
          $set: { barcode: newId, ownerId: new Types.ObjectId(userId) },
        };
        const options = { returnOriginal: false };

        const result = await ThirdPartyTickets.findOneAndUpdate(
          filter,
          update,
          options
        );
        if (result) {
          console.log("Updated document:", result);
          return result;
        } else {
          console.log("Document not found");
        }
        return {};
      } catch (error) {
        console.log(error);
        return {};
      }
    },
  },
};

export default thirdPartyTicketsResolvers;
