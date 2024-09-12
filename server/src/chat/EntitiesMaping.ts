import { WitEntity } from "../graphql/resolvers/chat/chat"

export default {
    ["wit$datetime" as WitEntity]: {
        from: "[0].values[0].from.value",
        to: "[0].values[0].to.value"
    },
    ["wit$location" as WitEntity]: {
        location: "[0].body"
    },
    ["wit$notable_person" as WitEntity]: {
        eventName: "[0].body"
    }
}