import { useMutation } from "urql";
import { graphql } from "../../graphql";
import { MutationResponse, TicketResponse } from "../../graphql/graphql";
import EventCard from "../EventCard/EventCard";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { DisplayTicket } from "../DisplayTicket";
import PutOnSellModal from "../PutOnSellModal";

const CREATE_EVENT_MUTATION = graphql(`
  mutation UpdateMarket($ticketId: String!) {
    updateMarket(ticketId: $ticketId) {
      message
      code
    }
  }
  `);

interface MyTicketCardProps {
    ticket: TicketResponse
    isOnMarket: boolean;
    localUpdateMarketTime: (ticketId: string) => void;
}

export const MyTicket = (props: MyTicketCardProps) => {
    const { isOnMarket, localUpdateMarketTime, ticket } = props;
    const { name, image, ticketId, type, location, price, onMarketTime } = ticket;
    const [displayTicket, setDisplayTicket] = useState<boolean>(false);
    const [sellModalOpen, setSellModalOpen] = useState<boolean>(false);
    const { enqueueSnackbar } = useSnackbar();
    const [updateMarketStatusResult, updateMarketStatus] = useMutation<
        {
            updateMarket: MutationResponse;
        }>(CREATE_EVENT_MUTATION);

    function onMarketChange() {
        toggleModalView();
        updateMarketStatus({ ticketId }).then((result) => {
            if (result.error) {
                console.error("Error updating ticket:", result.error);
                enqueueSnackbar("An error occurred", { variant: "error" });
            } else {
                localUpdateMarketTime(ticketId || "");
                enqueueSnackbar(`Ticket is ${!isOnMarket ? "on" : "off"} market`, { variant: "success" });
                console.log("Ticket updated:", result.data?.updateMarket);
            }
        });
    }

    function toggleModalView() {
        setSellModalOpen(prev => !prev);
    }

    function toggleDisplayTicket() {
        setDisplayTicket(prev => !prev);
    }

    const menuItems = [
        { label: ` ${!isOnMarket ? "Put ticket up on market" : "Take ticket off the market"}`, onClick: toggleModalView },
        { label: "Show ticket details", onClick: toggleDisplayTicket }
    ]

    return (
        <>
            {sellModalOpen && (
                <PutOnSellModal
                    eventName={name || ""}
                    sellPrice={price || 0}
                    commission={2} // example commission percent, replace with your actual value
                    image={image}
                    onClose={toggleModalView}
                    onPutOnSell={onMarketChange}
                    isOnMarket={!!onMarketTime}
                />
            )}
            {displayTicket && <DisplayTicket ticket={ticket} isOpen={displayTicket} toggleIsOpen={toggleDisplayTicket} />}
            <EventCard
                title={name!}
                header={type!}
                subheader={location!}
                image={image || undefined}
                id={ticketId!}
                menuItems={menuItems}
                isOnMarket={isOnMarket}
            />
        </>
    )
}

