import { useState } from "react";
import _ from "lodash";
import { MessageDirection } from "@chatscope/chat-ui-kit-react/src/types/unions";
import { gql, useMutation } from "urql";
import { Typography } from "@mui/material";
import { Chatbot } from "./Chatbot";
import { ChatResponse, InputMessage } from "../graphql/graphql";
import { useEventContext } from "../hooks/context/EventContext";

const GET_CHATBOT_RESPONSE = gql`
  mutation ChatCommand($inputMessage: InputMessage!) {
    chatCommand(inputMessage: $inputMessage) {
      responseMessage
      eventName
      isEmpty
      location
      from
      to
      type
    }
  }
`
export default function Captain() {
  const [messages, setMessages] = useState<{ messageData: string, direction: MessageDirection }[]>([]);
  const { setEventFilter } = useEventContext();

  const [result, getChatResponse] = useMutation<{
    chatCommand: ChatResponse
  }>(GET_CHATBOT_RESPONSE)

  function handleComplete(message: string): void {
    setMessages(prev => ([...prev, { messageData: message, direction: "outgoing" }]));

    const inputMessage: InputMessage = { message }

    // Call the createEvent mutation with the inputEvent object
    getChatResponse({ inputMessage }).then((result: any) => {
      if (result.error) console.error("Error generating chat reponse:", result.error)
      else {
        const { eventName: name, location, from, to, type } = result.data.chatCommand;
        const eventFilters = { name, location, from: new Date(from).getTime(), to: new Date(to).getTime() };

        setEventFilter(eventFilters);
        setMessages(prev => ([...prev, { type, messageData: result.data.chatCommand.responseMessage, direction: "incoming", isEmpty: result.data.chatCommand.isEmpty }]));
      }
    })
  }

  return (
    <div >
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>The Captain</Typography>
      <Chatbot handleMessageComplete={handleComplete} messages={messages} />
    </div>
  )
}