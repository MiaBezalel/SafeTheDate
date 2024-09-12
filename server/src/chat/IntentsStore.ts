import { WitIntent } from "../graphql/resolvers/chat/chat"

export default {
    ["get_event" as WitIntent]: {
        responseMessage: "The captain found some events for you",
    },
    ["navigate_page" as WitIntent]: {
        responseMessage: "The captain will take you to the requested page"
    },
    ["nothing" as WitIntent]: {
        responseMessage: "The captain didn't processed the request properly, please request events queries or page navigation orders."
    },
    ["empty" as WitIntent]: {
        responseMessage: "The captain didn't find the searched events, please try again."
    },
    ["message_to_long" as WitIntent]: {
        responseMessage: "Requests can't be longer than 280 characters"
    },
    ["error" as WitIntent]: {
        responseMessage: "Something went wrong, please try again or consult with the support."
    },

}