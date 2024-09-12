export default `
    type ChatResponse {
        responseMessage: String!
        isEmpty: Boolean
        eventName: String
        location: String
        from: String
        to: String
        type: String
    }

    input InputMessage {
        message: String!
    }

    type Mutation {
        chatCommand(inputMessage: InputMessage!): ChatResponse!
    }
`
