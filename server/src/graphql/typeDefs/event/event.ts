export default `
    type Event {
        id: String
        name: String
        location: String
        timeAndDate: Float
        type: String
        ticketsAmount: Int
        ticketPrice: Int
        description: String
        ownerId: String
        image: Upload
        isExternal: Boolean
    }

    scalar Upload

    input InputEvent {
        name: String!
        location: String!
        timeAndDate: Float!
        type: String!
        ticketsAmount: Int!
        description: String!
        ticketPrice: Int!
        image: Upload
    }

    input FilterEventParams {
        name: String
        location: String
        from: Float
        to: Float
    }

    type Query {
        event(filterParams: FilterEventParams, skip: Int, limit: Int, ids: [String], userId: String): [Event!]!
    }

    type Query {
        eventCount(filterParams: FilterEventParams, ids: [String], userId: String): Int!
    }

    type Mutation {
        createEvent(inputEvent: InputEvent!): MutationResponse! @auth
    }

    type Mutation {
        decreaseTicketAmount(eventId: String!): MutationResponse!
    } 
`;
