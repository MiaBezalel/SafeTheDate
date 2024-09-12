import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import QRCode from "react-qr-code";
import { Divider, Grid, Stack, Typography } from "@mui/material";
import logo from "../assets/logo.png";
import { useAuth } from "../hooks/authController/AuthContext"
import { TicketResponse } from '../graphql/graphql';
import { useState } from "react"

const BARCODE_SIZE = 256;

interface DisplayTicketProps {
  ticket: TicketResponse;
  isOpen: boolean;
  toggleIsOpen: () => void;
}

export const DisplayTicket = ({ ticket, isOpen, toggleIsOpen }: DisplayTicketProps) => {
    const { timeAndDate, barcode, location, name } = ticket;
    const { currentUser } = useAuth();

  let firstName = "";
  let lastName = "";

  if (currentUser) {
    firstName = currentUser["firstName"];
    lastName = currentUser["lastName"];
  }
  let time = new Date(timeAndDate || new Date());

    const hourTime = time.toLocaleTimeString("it-IT", {hour: '2-digit', minute:'2-digit'});
    const dateTime = time.toLocaleDateString("he");

    const handleClose = () => {
        toggleIsOpen();
    };

    return (
        <Dialog
        open={isOpen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <Grid
          container
          direction={"column"}
          alignItems={"center"}
          rowSpacing={2}
          padding={2}
        >
          <img
            style={{
              width: "100%",
              maxWidth: "200px",
              height: "auto",
            }}
            src={logo}
            alt="fireSpot"
          />
          <Typography variant="h5">{`Entry Ticket - ${name}`}</Typography>
          <Grid item>
            <DialogContentText align="center">
              <Typography variant="h6">{`${firstName} ${lastName}`}</Typography>
              <Typography variant="h6">{`${dateTime} ${hourTime}`}</Typography>
              <Typography variant="h6"> {location} </Typography>
            </DialogContentText>
            <Divider />
          </Grid>
          <Grid item>
            <Typography align="center">Present in the entry with id</Typography>
            {ticket.barcode ?
            <QRCode value={ticket.barcode} size={BARCODE_SIZE} />
            : "Go to the profile to view the barcode"}
          </Grid>
        </Grid>
      </Dialog>
    );


}
