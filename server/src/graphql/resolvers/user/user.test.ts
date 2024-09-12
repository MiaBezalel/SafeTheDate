import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { parse } from "graphql";
import { yoga } from "../../../server";
import { ObjectId } from "bson";
import { number } from "yargs";

const UPDATE_USER_CREDIT = `
  mutation updateCredit($userId: String!, $newCredit: Float!) {
    updateCredit(userId: $userId, newCredit: $newCredit) {
      message
      code
    }
  }
`;

const GET_USER_NAME = `
query getUserName($userId: String!) {
  user(userId: $userId) {
    username
  }
}
`

describe('Event tests', () => {
    let executor;

    beforeAll(() => {
        executor = buildHTTPExecutor({
            fetch: yoga.fetch,
        });
    });

    it("should return name", async () => {
        const result = await executor({
            document: parse( `
            query {
              user( userId: "6467b892b8b1b2377f6e5a77" ) {
                firstName
              }
            }
          `)
        })

        expect(result.data).toBeNaN;
        expect(result.data.user.firstName).toBeNaN;
    })

    it("should return matched user name", async () => {
        const result = await executor({
            document: parse( `
            query {
              user( userId: "6467b892b8b1b2377f6e5a77" ) {
                username
              }
            }
          `)
        })

        expect(result.data.user.username).toBe("Maya Betzalel");
    })

    it("should return credit as number", async () => {
        const result = await executor({
            document: parse( `
            query {
              user( userId: "6467b892b8b1b2377f6e5a77" ) {
                credit
              }
            }
          `)
        })

        expect(result.data.user.credit).toBeGreaterThanOrEqual(0)
    })

    it("should not return user for made up user", async () => {
        const result = await executor({
            document: parse( `
            query {
              user( userId: "not exist" ) {
                credit
              }
            }
          `)
        })

        expect(result).toBeNull;
    })

    it("should return email type", async () => {
        const result = await executor({
            document: parse( `
            query {
              user( userId: "6467b892b8b1b2377f6e5a77" ) {
                email
              }
            }
          `)
        })

        expect(result).toBeNaN;
        expect(result.data.user.email).toContain("@")
        expect(result.data.user.email).toContain(".com")
    })
})
