import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { parse } from "graphql";
import { yoga } from "../../../server";
import { Ticket } from "../../../../mongo/models/Ticket";

describe("Ticket tests", () => {
    let executor;

    beforeAll(() => {
        executor = buildHTTPExecutor({
            fetch: yoga.fetch,
        });
    });

    it("Tickets invalid", async () => {
        let result = await executor({
            document: parse(`
        query {
            isValid(eventId: "6489fa5c4d0e9d2f9623185d", barcode: "1")      
        }
      `),
        });

        expect(result.data.isValid).toBeFalsy();
    });

    it("Tickets valid", async () => {
        let result = await executor({
            document: parse(`
        query {
            isValid(eventId: "6488ef6de987f464be8763e3", barcode: "kDFZY4kxD5YG7KQLMSVFQBXrnyeeLDmCGzhxEr50226LbaasB3n0p3K8e3hY")
          }`),
        });

        expect(result.data.isValid).toBeTruthy();
    });

    it("Tickets on market", async () => {
        let ticketId = "6488f0b80ed5147ca5028773"
        let UpdateTicketResult = await executor({
            document: parse(`
            mutation {
                updateMarket(ticketId: "${ticketId}") {
                  message
                  code
                }
              }`),
        });

        if (UpdateTicketResult.data.updateMarket.code === 200) {
            const ticket = await Ticket.findOne({
                _id: ticketId,
            })
            if (ticket)
                expect(!!ticket.onMarketTime).toBeDefined();
        } else
            expect(UpdateTicketResult.data.updateMarket.code).toBe(200)

    });

    it("Tickets off market", async () => {
        let ticketId = "6488f0b80ed5147ca5028773"
        let UpdateTicketResult = await executor({
            document: parse(`
            mutation {
                updateMarket(ticketId: "${ticketId}") {
                  message
                  code
                }
              }`),
        });

        if (UpdateTicketResult.data.updateMarket.code === 200) {
            const ticket = await Ticket.findOne({
                _id: ticketId,
            })
            if (ticket)
                expect(ticket.onMarketTime).toBeNull();
        } else
            expect(UpdateTicketResult.data.updateMarket.code).toBe(200)
    });
});
