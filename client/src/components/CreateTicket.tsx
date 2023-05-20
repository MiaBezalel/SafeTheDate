/*eslint-disable-no-unescaped-entities*/
import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useNavigate } from "react-router-dom"
import QRCode from 'react-qr-code';
import { Typography, Divider, Grid } from "@mui/material";
import logo from "../assets/logo.png";
import { useAuth } from "../hooks/authController/AuthContext"  
import { graphql } from "../graphql";
import { useQuery } from "urql";
import _ from 'lodash';

const GET_EVENT = graphql(`
    query getEventById($eventId: [String]) {
        event(ids: $eventId) {
            id
            name
            location
            timeAndDate
            type
            image
        }
    }
`);

export const CreateTicketComp = ( {ticket} ) => {
    const [open, setOpen] = React.useState(true);
    const navigate = useNavigate()
    const { currentUser } = useAuth()
    let firstName = ""
    let lastName = ""
    let time = new Date()
    let location = ""

    const event = useQuery({
        query: GET_EVENT, 
        variables: {
            eventId: ["6467686b41349cba46cad54e"],
        }
    });

    let eventData = event[0].data || {}
    
    if(event && eventData  && !_.isEqual(eventData, {}) && eventData["event"]) {
        eventData = eventData["event"][0]
        console.log(eventData)

        time = eventData["timeAndDate"]
        location = eventData["location"]
    }
    if(currentUser) {
        firstName = currentUser["firstName"]
        lastName = currentUser["lastName"]
    }
    const handleClose = () => {
      console.log(ticket)
      setOpen(false);
      navigate("/")
    };
  
    return (
        <div>
            <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            >
            <Grid item xs={2}>
                <img
                style={{ height: "10vh", width: "10=7vh", cursor: "pointer" }}
                src={logo}
                alt="fireSpot"
                />
            </Grid>
            <DialogTitle style={{ textAlign:"center" }} id="alert-dialog-title">
                {"Entry Ticket"}
                {"Event name"}
            </DialogTitle>
            <h6 style={{ textAlign:"center" }}>Present in the entry with id</h6>
            <Divider/>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                <h3> {firstName} {lastName} </h3>
                {/* <h5> {time} </h5> */}
                <h5> {location} </h5>
                </DialogContentText>
                <QRCode  
                    value=""
                    size={256}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Disagree</Button>
                <Button onClick={handleClose} autoFocus>
                Agree
                </Button>
            </DialogActions>
            </Dialog>
        </div>
        
    );
}


export default CreateTicketComp