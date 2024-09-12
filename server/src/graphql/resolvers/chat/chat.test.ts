import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { parse } from "graphql";
import { yoga } from "../../../server";
import { forEach } from "lodash";

describe("Chat tests", () => {
    let executor;

    beforeAll(() => {
        executor = buildHTTPExecutor({
            fetch: yoga.fetch,
        });
    });

    it("Chat request with empty response", async () => {

        const result = await executor({
            document: parse(`
      mutation {
        chatCommand(inputMessage: {message: "${"please find me ticket for rihanna"}"}) {
          isEmpty
        }
      }
      `),
        });
        
        expect(result.data.chatCommand.isEmpty).toBeTruthy();
    });

    it("Chat request gibrish", async () => {

        const result = await executor({
            document: parse(`
      mutation {
        chatCommand(inputMessage: {message: "${"asdfasdfasdfa"}"}) {
          type
        }
      }
      `),
        });
        console.log(result);
        
        expect(result.data.chatCommand.type).toEqual("nothing");
    });

    // it("chat date is this week", async () => {
    // const todayTime = Date.now();
    //     const nextWeekTime = Date.now() + 1000 * 60 * 60 * 24 * 7;
    
    //     let result = await executor({
    //       document: parse(`
    //         query {
    //           event(filterParams: {from: ${todayTime}, to: ${nextWeekTime}}) {
    //             timeAndDate
    //           }
    //         }
    //       `),
    //     });
    
    //     result = result["data"]["event"];
    
    //     forEach(result, ({ timeAndDate }) => {
    //       expect(timeAndDate).toBeGreaterThanOrEqual(todayTime);
    //       expect(timeAndDate).toBeLessThanOrEqual(nextWeekTime);
    //     });
    
    //   });
});
