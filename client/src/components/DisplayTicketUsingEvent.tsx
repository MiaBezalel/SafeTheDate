/*eslint-disable-no-unescaped-entities*/

import { graphql } from "../graphql";
import { useQuery } from "urql";
import _ from 'lodash';
import { InputTicket, TicketResponse } from "../graphql/graphql";
import { DisplayTicket } from './DisplayTicket';
import { useState } from "react";

const GET_EVENT = graphql(`
    query events($ids: [String]) {
        event(ids: $ids) {
            id
            name
            location
            timeAndDate
            type
            image
        }
    }
`);

interface DisplayTicketProps {
    ticket: Partial<InputTicket>
}

const DisplayTicketUsingEvent = ({ ticket }: DisplayTicketProps) => {
    const [open, setOpen] = useState(true);

    let location = ""
    let name = ""
    
    const event = useQuery({
        query: GET_EVENT,
        variables: {
            ids: [ticket.eventId!],
        }
    });

    let eventData = event[0].data || {}
    
    if (event && eventData && !_.isEqual(eventData, {}) && eventData["event"]) {
        eventData = eventData["event"][0]
        location = eventData["location"]
        name = eventData["name"]
    }
    let timeAndDate = new Date(eventData["timeAndDate"])

    const toggleIsOpen = () => {
        setOpen(prev => !prev);
    }

    return (
        <DisplayTicket isOpen={open} toggleIsOpen={toggleIsOpen} ticket={(({...ticket, location, name, timeAndDate}) as unknown) as TicketResponse}/>
    )
}

export default DisplayTicketUsingEvent
