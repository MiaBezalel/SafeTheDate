import { useNavigate } from "react-router-dom"
import {
    ChatContainer,
    MessageList,
    Message,
    MessageInput,
} from "@chatscope/chat-ui-kit-react"
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css"
import { MessageDirection } from "@chatscope/chat-ui-kit-react/src/types/unions"
import { Button } from "@mui/material"
import { RoutePaths } from "../App"

export interface chatbotProps {
    handleMessageComplete: (message: string) => void;
    messages: { messageData: string, direction: MessageDirection, type?: string, isEmpty?: boolean }[]
}

export function Chatbot(props: chatbotProps) {
    const { handleMessageComplete, messages } = props
    console.log(messages)
    const navigate = useNavigate()

    function handleClick(): void {
        navigate(RoutePaths.CAPTAIN_EVENTS)
    }

    return (
        <div style={{ position: "relative", height: "20rem", width: "16rem" }}>
            <ChatContainer >
                <MessageList>
                    {messages.map((message, index) =>
                        <>
                            <Message
                                key={index + message.messageData}
                                model={{ message: message.messageData, direction: message.direction, position: "first" }} />
                            {(message.direction == "incoming" && message?.type === "get_event" && !message?.isEmpty) &&
                                <Button color="secondary" onClick={handleClick}>Click to see events</Button>}
                        </>
                    )}
                </MessageList>
                <MessageInput placeholder="Type message here" onSend={handleMessageComplete} />
            </ChatContainer>
        </div>
    )
}