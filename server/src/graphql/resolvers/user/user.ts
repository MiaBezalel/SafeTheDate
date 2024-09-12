import { MutationResolvers, QueryResolvers } from "../../typeDefs";
import { User as UserModel } from "../../../../mongo/models/User";
import mongoose, { Types } from "mongoose";
import { readAndConvertToBase64, writeBase64ToFile } from "../../../../mongo/FileHandler";


const FAILED_MUTATION_MESSAGE = "mutation upadteCredit failed";

const userResolvers: {
  Query: Pick<QueryResolvers, "user">;
  Mutation: Pick<MutationResolvers, "updateCredit" | "updateImage">;
} = {
  Query: {
    user: async (parent, args, context, info) => {
      const { userId } = args;

      const userData = await UserModel.findOne({
        _id: new Types.ObjectId(userId),
      })
        .exec()
        .then(
          async ({ _id, username, email, firstName, lastName, credit, image }) => {
            return {
              _id: _id?.toString(),
              username,
              email,
              firstName,
              lastName,
              credit,
              ...(image === "exists" && {image: await readAndConvertToBase64(_id + ".jpg")}),
            };
          }
        );
      return userData;
    },
  },
  Mutation: {
    updateCredit: async (parent, { userId, newCredit }) => {
      try {
        await UserModel.updateOne(
          { _id: new Types.ObjectId(userId) },
          { $set: { credit: newCredit } }
        );
        console.log("newCredit " + newCredit)
        return { message: "user credit updated succesfully", code: 200 } as const;;
      } catch (error) {
        console.log("failed with " + error);
        return { message: FAILED_MUTATION_MESSAGE, code: 500 }  as const;;
      }
    },
    updateImage: async (parent, args, context, info) => {
      try {
        const { userId, image } = args;

        let user = await UserModel.updateOne(
          { _id: new Types.ObjectId(userId) },
          { $set: { image: "exists" } }
        );
        writeBase64ToFile(userId + ".jpg", image)

        return { message: "user credit updated succesfully", code: 200 };
      } catch (error) {
        console.log("failed with to save image" + error);
        return { message: FAILED_MUTATION_MESSAGE, code: 500 };
      }
    },
  },
};

export default userResolvers;
