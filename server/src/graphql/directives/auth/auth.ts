import { GraphQLError, GraphQLSchema } from "graphql";
import { getDirective, mapSchema, MapperKind } from "@graphql-tools/utils";
import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

export const authSchemaTransformer = (schema: GraphQLSchema) =>
  mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const authDirective = getDirective(schema, fieldConfig, "auth")?.[0];

      if (authDirective && process.env.NEED_AUTH === "true") {
        const originalResolver = fieldConfig.resolve;
        fieldConfig.resolve = async (source, args, context, info) => {
          const token = await context.request.cookieStore?.get("access_token");
          const { AUTH_ENDPOINT } = process.env;

          if (!!token) {
            try {
              // @ts-ignore
              const user = await axios
                .get(`${AUTH_ENDPOINT}/api/auth/session`, {
                  headers: {
                    cookie: `${token.name}=${token.value}`,
                  },
                  withCredentials: true,
                })
                .then(({ data }) => data);
              if (!user._id) {
                console.log("Auth failed: user._id not valid");
                return new GraphQLError(
                  `Auth failed! please add token to the request`
                );
              }
              context.user = user;
              return originalResolver(source, args, context, info);
            } catch (e) {
              console.log("Auth failed1");
              return new GraphQLError(
                `Auth failed! please add token to the request`
              );
            }
          }
          console.log("Auth failed2");
          return new GraphQLError(
            `Auth failed! please add token to the request`
          );
        };
      }

      return fieldConfig;
    },
  });
