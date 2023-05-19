export default `
    type Event {
        id: String
        name: String
        location: String
        timeAndDate: Float
        type: String
        ticketsAmount: Int
        image: Upload
    }

    scalar Upload

    input InputEvent {
        name: String!
        location: String!
        timeAndDate: Float!
        type: String!
        ticketsAmount: Int!
        image: Upload
    }

    input FilterEventParams {
        name: String
        location: String
        from: Float
        to: Float
    }

    type Query {
        event(filterParams: FilterEventParams, skip: Int, limit: Int, ids: [String]): [Event!]!
    }

    type Query {
        eventCount(filterParams: FilterEventParams, ids: [String]): Int!
    }

    type Mutation {
        createEvent(inputEvent: InputEvent!): MutationResponse!
    }
`
