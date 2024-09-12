import { InputMessage } from "../../typeDefs"
import { Event as EventModel } from "../../../../mongo/models/Event";
import EntitiesMaping from "../../../chat/EntitiesMaping"
import IntentsStore from "../../../chat/IntentsStore"
const { Wit } = require("node-wit")
var _ = require("lodash")

type NewType = Date;

interface emptySearchVariables {
  eventName?: string;
  location?: string;
  from?: Date;
  to?: NewType;
}

async function isSearchResultsEmpty(variables: emptySearchVariables) {
  const { eventName, location, from, to } = variables;

  let filter = {
    ...(eventName && { name: { $regex: eventName, $options: "i" } }),
    ...(location && { location: { $regex: location, $options: "i" } }),
    ...((from || to) && {
      timeAndDate: {
        ...(from && { $gte: new Date(from) }),
        ...(to && { $lt: new Date(to) }),
      },
    }),
  };

  let events = await EventModel.find(filter);

  return events.length === 0;
}

export default {
  Mutation: {
    chatCommand: async (
      parent: any,
      { inputMessage }: { inputMessage: InputMessage } // Specify the type of inputEvent argument
    ) => {
      // Extract values from the inputEvent object
      const { message } = inputMessage
      // Create a new event using the extracted values
      
      let isEmpty = false
      // Check if message to long
      if (message.length > 280) {
        console.error("Got error from wit ai, message to long")
        return {
          responseMessage: IntentsStore.message_to_long.responseMessage,
          isEmpty: isEmpty,
          type: "nothing",
        }
      }

      const client = new Wit({ accessToken: process.env.BOT_ACCESS_TOKEN })
      try {
        var res = await client.message(message, {})
      } catch (e) {
        console.error("Got error from wit ai")
        return {
          responseMessage: IntentsStore.error.responseMessage,
          isEmpty: isEmpty,
          type: "nothing",
        }
      }

      if (res && !res.error) {
        let intent = matchWitToSearchedRequests(res)

        var entities = matchEntities(res)

        let responseMessage

        if (intent && IntentsStore?.[intent] && intent !== "nothing") {
          let nestedEntities = {};
          entities.forEach(entity => {
            nestedEntities = { ...nestedEntities, ...entity }
          });

          isEmpty = await isSearchResultsEmpty(nestedEntities);

          if (isEmpty) {
            responseMessage = IntentsStore?.empty?.responseMessage;
          } else responseMessage = IntentsStore[intent]?.responseMessage;

        }
        else responseMessage = IntentsStore?.nothing?.responseMessage;

        return {
          isEmpty: isEmpty,
          type: intent,
          ...Object.assign({}, ...entities),
          responseMessage,
        }
      }
    },
  },
}

export type WitEntity =
  | "wit$datetime:datetime"
  | "wit$location:location"
  | "wit$notable_person:notable_person"
export type WitIntent = "get_event" | "navigate_page" | "nothing" | "error"

interface WitResponse {
  entities: {
    [key: string]: [
      {
        confidence: number
        name: string
      }
    ]
  }
  intents: [
    {
      confidence: number
      name: string
    }
  ]
}

function matchWitToSearchedRequests(responseMessage: WitResponse): WitIntent {
  // Sort by confidence to get the best hypothesis of the intent
  var sortedIntents = responseMessage.intents.sort(
    (intent1, intent2) => intent1.confidence - intent2.confidence
  )

  // Get the best hypothesis
  var intent = sortedIntents[0];

  return intent ? intent.name as WitIntent : "nothing";
}

function matchEntities(responseMessage: WitResponse): any {
  // Pick the relevant entities
  var entities = Object.values(responseMessage.entities).map((entity) =>
    Object.entries(EntitiesMaping[entity[0].name]).map(([key, value]) => ({
      [key]: _.get(entity, value),
    }))
  )

  return entities.flat(1)
}
