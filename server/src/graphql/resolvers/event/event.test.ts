import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { parse } from "graphql";
import { yoga } from "../../../server";
import { forEach } from "lodash";

describe("Event tests", () => {
  let executor;

  beforeAll(() => {
    executor = buildHTTPExecutor({
      fetch: yoga.fetch,
    });
  });

  it("Event count need to be number", async () => {
    const result = await executor({
      document: parse(`
        query {
          eventCount
        }
      `),
    });

    expect(result["data"].eventCount).not.toBeNaN();
  });

  it("Event with skip and limit", async () => {
    const skip = 0;
    const limit = 10;

    const result = await executor({
      document: parse(`
        query {
          event(skip: ${skip}, limit: ${limit}) {
            name
          }
        }
      `),
    });

    expect(result["data"]["event"].length).toEqual(limit);
  });

  it("Evente filtered by name", async () => {
    const name = "i";

    let result = await executor({
      document: parse(`
        query {
          event(filterParams: {name: "${name}"}) {
            name
          }
        }
      `),
    });

    result = result["data"]["event"];

    forEach(result, ({ name: eventName }) => {
      expect(eventName).toContain(name);
    });
  });

  it("Events date is this week", async () => {
    const todayTime = Date.now();
    const nextWeekTime = Date.now() + 1000 * 60 * 60 * 24 * 7;

    let result = await executor({
      document: parse(`
        query {
          event(filterParams: {from: ${todayTime}, to: ${nextWeekTime}}) {
            timeAndDate
          }
        }
      `),
    });

    result = result["data"]["event"];

    forEach(result, ({ timeAndDate }) => {
      expect(timeAndDate).toBeGreaterThanOrEqual(todayTime);
      expect(timeAndDate).toBeLessThanOrEqual(nextWeekTime);
    });

  });
});
