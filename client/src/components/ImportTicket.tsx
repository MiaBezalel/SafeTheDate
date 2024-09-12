import { useState, useEffect } from "react";
import { useQuery } from "urql";
import { QrReader } from "react-qr-reader";
import { Box, Typography } from "@mui/material";
import ValidIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import InvalidIcon from "@mui/icons-material/CancelOutlined";

import { graphql } from "../graphql";
import { Exact, ReturnedData } from "../graphql/graphql";
import Spinner from "../utils/spinner";
import { Center } from "../utils/center";

export const ImportTicket = () => {
  const [code, setCode] = useState("");
  const [showIsValid, setShowIsValid] = useState(false);

  const VALIDATE_TICKET_QUERY = graphql(`
    query validateTicketAndImport($id: String) {
      validateTicketAndImport(id: $id) {
        event {
          id
          image
          location
          name
          ticketsAmount
          timeAndDate
          type
          ticketPrice
          description
          ownerId
        }
        ticket {
          barcode
          eventId
          isSecondHand
          onMarketTime
          ownerId
          id
          price
        }
      }
    }
  `);

  const [{ data: isValidData, fetching: fetchingIsValid }] = useQuery<{
    validateTicketAndImport: Exact<ReturnedData>;
  }>({
    query: VALIDATE_TICKET_QUERY,
    variables: {
      id: code,
    },
    pause: !code?.length,
  });

  const handleScan = (result: any) => {
    if (result) {
      console.log("scaned: ", result?.text);
      setCode(result?.text);
    }
  };

  useEffect(() => {
    if (!isValidData) return;

    setShowIsValid(true);
    setCode("");
  }, [isValidData]);

  useEffect(() => {
    showIsValid && setTimeout(() => setShowIsValid(false), 3000);
  }, [showIsValid]);

  const renderIsValidTicket = () => {
    if (fetchingIsValid) return <Spinner />;

    if (!showIsValid) return <></>;

    return (
      <Box
        sx={{
          color: isValidData?.validateTicketAndImport?.ticket?.id
            ? "success.main"
            : "error.main",
        }}
      >
        <Center>
          {isValidData?.validateTicketAndImport?.ticket?.id ? (
            <>
              <ValidIcon sx={{ fontSize: "10rem" }} />
              <Typography variant="h1">Imported</Typography>
            </>
          ) : (
            <>
              <InvalidIcon sx={{ fontSize: "10rem" }} />
              <Typography variant="h1">Not Valid</Typography>
            </>
          )}
        </Center>
      </Box>
    );
  };

  return (
    <Center>
      <QrReader
        onResult={handleScan}
        constraints={{ facingMode: "user" }}
        videoContainerStyle={{
          width: "20rem",
          height: "20rem",
        }}
      />
      {renderIsValidTicket()}
    </Center>
  );
};

export default ImportTicket;
