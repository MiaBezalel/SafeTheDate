export default `
    type Ticket {
        _id: ID
        ownerId: String
        eventId: String
        isSecondHand: Boolean
        onMarketTime: Float
        price: Float
        barcode: String
    }

    type TicketResponse {
        ticketId: String
        ownerId: String
        eventId: String
        barcode: String
        isSecondHand: Boolean
        onMarketTime: Float
        name: String
        location: String
        timeAndDate: Float
        price: Float
        type: String
        image: Upload
    }

    input InputTicket {
        eventId: String!,
        isSecondHand: Boolean!, 
        price: Float!,
        isExternal: Boolean!
    }

    input FilterTicketParams {
        userId: String
        eventId: String
        barcode: String
    }

    type Query {
        ticket(filterParams: FilterEventParams, skip: Int, limit: Int, ids: [String]): [TicketResponse!]! @auth
    }

    type Query {
        ticketCount(filterParams: FilterEventParams, ids: [String]): Int! @auth
    }

    type Mutation {
        updateMarket(ticketId: String!): MutationResponse!
    }

    type Query {
        isValid(eventId: String!, barcode: String!): Boolean!
    }

    type Mutation {
        purchaseTicket(inputTicket: InputTicket!): MutationResponse! @auth
    }
`;
