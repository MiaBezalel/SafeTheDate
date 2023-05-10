export default  `
    type Event {
        id: String
        name: String
        location: String
        timeAndDate: Float
        type: String
    }

    input InputEvent {
        name: String!
        location: String!
        timeAndDate: Float!
        type: String!
    }

    input FilterEventParams {
        name: String
        location: String
        from: Float
        to: Float
    }

    type Query {
        event(filterParams: FilterEventParams, substringName: String, skip: Int, limit: Int, ids: [String]): [Event!]!
    }

    type Mutation {
        createEvent(inputEvent: InputEvent!): MutationResponse!
    }
`
