/* eslint-disable no-debugger */
import { useState, useEffect } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useSnackbar } from "notistack";
import DisplayTicket from "../DisplayTicketUsingEvent";
import { useAuth } from "../../hooks/authController/AuthContext";
import { InputTicket, MutationResponse } from "../../graphql/graphql";
import { graphql } from "../../graphql";
import { useMutation, useQuery } from "urql";
import _ from "lodash";
import { useLocation } from "react-router-dom";
import { User } from "../../graphql/graphql";
import { Button } from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';

const PURCHASE_TICKET_MUTATION = graphql(`
  mutation purchaseTicket($inputTicket: InputTicket!) {
    purchaseTicket(inputTicket: $inputTicket) {
      message
      code
    }
  }
`);

const DECREASE_TICKET_AMOUNT = graphql(`
  mutation decreaseTicketAmount($eventId: String!) {
    decreaseTicketAmount(eventId: $eventId) {
      message
      code
    }
  }
`);

const GET_EVENT = graphql(`
  query getEvantById($ids: [String]) {
    event(ids: $ids) {
      id
      name
      location
      timeAndDate
      type
      image
      ticketsAmount
      ticketPrice
      isExternal
    }
  }
`);

const UPDATE_USER_CREDIT = graphql(`
  mutation updateCredit($userId: String!, $newCredit: Float!) {
    updateCredit(userId: $userId, newCredit: $newCredit) {
      message
      code
    }
  }
`);

const PaymentForm = ({
  ticketAmount,
  amount,
  description,
  newCredit,
}: {
  ticketAmount;
  amount: number;
  description: string;
  newCredit: number;
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [orderID, setOrderID] = useState(false);
  const [success, setSuccess] = useState(false);
  const [purchaseTicket, setPurchaseTicket] = useState(false);
  const [decrease, setDecrease] = useState(false);
  const { currentUser, setCredit } = useAuth();
  const [user, setCurrentUser] = useState<User>();
  const [isShowTicket, setShowTicket] = useState(false);
  const [ticketData, setTicketData] = useState<Partial<InputTicket>>({});

  console.log("The new credit is going to be: " + newCredit);
  console.log("The ticket price is going to be: " +   amount);


  const [PurchaseTicketResult, PurchaseTicket] = useMutation<
    {
      PurchaseTicket: MutationResponse;
    },
    { inputTicket: InputTicket }
  >(PURCHASE_TICKET_MUTATION);

  const [deacreaseTicketAmount, setDeacreaseTicketAmount] = useMutation<
    {
      eventId: string;
    },
    {}
  >(DECREASE_TICKET_AMOUNT);

  const [updateCredit, setUpdateCredit] = useMutation<
    {
      userId: string;
      newCredit: number;
    },
    {}
  >(UPDATE_USER_CREDIT);

  const { pathname } = useLocation();

  const eventId = pathname.split("/")[2];

  const event = useQuery({
    query: GET_EVENT,
    variables: {
      ids: [eventId!],
    },
  });

  let eventData = event[0].data || {};
  let ticketPrice;
  let isExternal;
  if (event && eventData && !_.isEqual(eventData, {}) && eventData["event"]) {
    eventData = eventData["event"][0];
    ticketPrice = eventData["ticketPrice"];
    isExternal = eventData["isExternal"] || false;
  }

  useEffect(() => {
    if (decrease) {
      setDecrease(false);
      ticketAmount(eventData["ticketsAmount"] - 1);
      const eventId = ticketData.eventId || "";
      setDeacreaseTicketAmount({ eventId }).then((result) => {
        if (result.error) console.error("Error creating ticket:", result.error);
      });
    }
  });

  useEffect(() => {
    if (purchaseTicket && currentUser) {
      const inputTicket: InputTicket = {
        eventId: eventId,
        isSecondHand: false,
        price: ticketPrice,
        isExternal: isExternal,
      };
      console.log(eventData["isExternal"]);
      // SecondHandTicket
      // if (
      //   dataCount["getAllSecondHandTicketsByEventId"] >
      //   eventData["ticketsAmount"] - 1
      // ) {
      //   updateSecondToFirst({
      //     createTicketParams: {
      //       eventId: eventId,
      //       isSecondHand: true,
      //     },
      //   });
      // }

      setTicketData(inputTicket);
      setCurrentUser(currentUser || []);
      const userId = currentUser ? currentUser["_id"] : "";

      PurchaseTicket({ inputTicket }).then((result) => {
        if (result.error) {
          console.error("Error creating ticket:", result.error);
          enqueueSnackbar("An error occurred", { variant: "error" });
        } else {
          setDecrease(true);
          setShowTicket(true);
          setCredit(newCredit)
          setUpdateCredit({ userId, newCredit });
          enqueueSnackbar("Ticket created successfully", {
            variant: "success",
          });
        }
      });
      setPurchaseTicket(false);
    }
  });

  // creates a paypal order
  const createOrder = async (data, actions) => {
    return actions.order
    .create({
      purchase_units: [
        {
          description: description,
          amount: {
            currency_code: "ILS",
            value: amount,
          },
        },
      ],
    })
    .then((orderID) => {
      setOrderID(orderID);
      return orderID;
    });
  };

  // check Approval
  const onApprove = (data, actions) => {
    return actions.order.capture().then(function (details) {
      setPurchaseTicket(true);
      const { payer } = details;
      setSuccess(true);
    });
  };

  //capture likely error
  const onError = (err) => {
    console.log(err);
    enqueueSnackbar("Could not complete tranaction " + err.message, {
      variant: "error",
    });
  };

  useEffect(() => {
    if (success) {
      enqueueSnackbar("Successful transaction! Your order id is: " + orderID, {
        variant: "success",
      });
    }
  }, [success]);

  const theme = createTheme({
    palette: {
      primary: {
        // Purple and green play nicely together.
        main: '#36343B',
      }
    },
  });

  return (
    <div>
      {amount?
      <PayPalScriptProvider
        options={{
          "client-id": process.env.REACT_APP_CLIENT_ID as string,
          currency: "ILS",
        }}
      >
        <PayPalButtons
          style={{ layout: "vertical" }}
          onApprove={onApprove}
          onError={onError}
          createOrder={createOrder}
          forceReRender={[amount]}
        />
      </PayPalScriptProvider>
      :
      <ThemeProvider theme={theme}>
        <Button variant="contained" color="primary" fullWidth={true} onClick={() => { setPurchaseTicket(true); }}>Pay with credit</Button>
      </ThemeProvider>
      }
      { isShowTicket ? <DisplayTicket ticket={ticketData} /> : <></> }
    </div>
  );
};

export default PaymentForm;
