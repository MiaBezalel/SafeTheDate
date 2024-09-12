import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "urql";
import { graphql } from "../graphql";
import { InputEvent, MutationResponse } from "../graphql/graphql";
import {
  Typography,
  TextField,
  Button,
  Grid,
} from "@mui/material";
import ImagePicker from "./ImagePicker";

const CREATE_EVENT_MUTATION = graphql(`
  mutation CreateEvent($inputEvent: InputEvent!) {
    createEvent(inputEvent: $inputEvent) {
      message
      code
    }
  }
`);

export const CreateEvent = () => {
  const eventNameRef = useRef<HTMLInputElement | null>();
  const eventLocationRef = useRef<HTMLInputElement | null>();
  const eventTimeAndDateRef = useRef<HTMLInputElement | null>();
  const eventTypeRef = useRef<HTMLInputElement | null>();
  const eventTicketAmountRef = useRef<HTMLInputElement | null>();
  const eventDescriptionRef = useRef<HTMLInputElement | null>();
  const eventTicketPriceRef = useRef<HTMLInputElement | null>();
  const [image, setImage] = useState(undefined);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  const [{ error }, createEvent] = useMutation<{
    createEvent: MutationResponse;
  }>(CREATE_EVENT_MUTATION);

  const onChangeImage = (image) => {
    setImage(image);
  };

  const handleDiscard = () => {
    if (eventDescriptionRef.current) eventDescriptionRef.current.value = "";
    if (eventLocationRef.current) eventLocationRef.current.value = "";
    if (eventNameRef.current) eventNameRef.current.value = "";
    if (eventTicketAmountRef.current) eventTicketAmountRef.current.value = "";
    if (eventTicketPriceRef.current) eventTicketPriceRef.current.value = "";
    if (eventTimeAndDateRef.current) eventTimeAndDateRef.current.value = "";
    if (eventTypeRef.current) eventTypeRef.current.value = "";
  };

  function validateForm() {
    const errors = {};

    if (!eventNameRef.current?.value) {
      errors["eventName"] = "Please enter the name of the event";
    }

    if (!eventLocationRef.current?.value) {
      errors["eventLocation"] = "Please enter the location of the event";
    }

    if (!eventTimeAndDateRef.current?.value) {
      errors["eventTimeAndDate"] = "Please enter the time and date of the event";
    }

    if (eventTimeAndDateRef.current?.value === "") {
      errors["eventTimeAndDate"] = "Event date and time are required";
    } else {
      const selectedDateTime = new Date(eventTimeAndDateRef.current?.value || 0);
      const currentDateTime = new Date();

      if (selectedDateTime <= currentDateTime) {
        errors["eventTimeAndDate"] = "Event date and time should be in the future";
      } else if (
        selectedDateTime.getTime() - currentDateTime.getTime() <
        60 * 60 * 1000 // 1 hour in milliseconds
      ) {
        errors["eventTimeAndDate"] =
          "Event should be scheduled at least 1 hour from now";
      }
    }

    if (!eventTypeRef.current?.value) {
      errors["eventType"] = "Please enter the type of the event";
    }

    if (!eventTicketAmountRef.current?.value) {
      errors["eventTicketAmount"] = "Please enter the ticket amount";
    }

    if (!eventTicketPriceRef.current?.value) {
      errors["eventTicketPrice"] = "Please enter the ticket price";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    // Clear the error message for the corresponding input field
    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  }

  function handleEventCreation() {
    if (!validateForm()) {
      return;
    }

    const inputEvent: InputEvent = {
      name: eventNameRef.current?.value || "",
      location: eventLocationRef.current?.value || "",
      timeAndDate: Date.parse(
        eventTimeAndDateRef.current?.value || new Date().toString()
      ),
      type: eventTypeRef.current?.value || "",
      ticketsAmount: eventTicketAmountRef.current?.value
        ? parseInt(eventTicketAmountRef.current?.value)
        : 1,
      description: eventDescriptionRef.current?.value || "",
      ticketPrice: eventTicketPriceRef.current?.value
        ? parseInt(eventTicketPriceRef.current?.value)
        : 1,
      image: image || "",
    };

    // Call the createEvent mutation with the inputEvent object
    createEvent({ inputEvent }).then((result) => {
      if (result.data?.createEvent.code === 500) {
        console.error("Error creating event:", result.error);
        setFormErrors({
          general: "An error occurred",
        });
      } else if (result.error?.message.includes("Auth failed")) {
        setFormErrors({
          general: "Token expired, Please login again or refresh",
        });
      } else {
        navigate("/");
        console.log("Event created:", result.data?.createEvent);
      }
    });
  }

  return (
    <>
      <Typography variant="h3" align="center" gutterBottom color="white">
        Create The Next Event
      </Typography>
      <Grid container padding={10} columnSpacing={2}>
        <Grid item xl={3} md={12} sm={12} xs={12}>
          <ImagePicker
            image={image}
            onChangeImage={onChangeImage}
            buttonTitle={"Pick an image"}
          />
        </Grid>
        <Grid item container spacing={2} xl={9} md={12} sm={12} xs={9}>
          <Grid container spacing={2}>
            <Grid item xl={12} md={12} sm={12} xs={12}>
              <TextField
                fullWidth
                label="Name of Event"
                color="secondary"
                variant="outlined"
                inputRef={eventNameRef}
                error={Boolean(formErrors["eventName"])}
                helperText={formErrors["eventName"]}
                onChange={handleInputChange}
                name="eventName"
              />
            </Grid>
            <Grid item xl={6} md={6} sm={12} xs={12}>
              <TextField
                fullWidth
                label="Location"
                color="secondary"
                inputRef={eventLocationRef}
                variant="outlined"
                error={Boolean(formErrors["eventLocation"])}
                helperText={formErrors["eventLocation"]}
                onChange={handleInputChange}
                name="eventLocation"
              />
            </Grid>
            <Grid item xl={6} md={6} sm={12} xs={12}>
              <TextField
                fullWidth
                label="Time and Date"
                color="secondary"
                inputRef={eventTimeAndDateRef}
                variant="outlined"
                type="datetime-local"
                error={Boolean(formErrors["eventTimeAndDate"])}
                helperText={formErrors["eventTimeAndDate"]}
                onChange={handleInputChange}
                name="eventTimeAndDate"
              />
            </Grid>
            <Grid item xl={6} md={6} sm={12} xs={12}>
              <TextField
                fullWidth
                color="secondary"
                label="Type of Event"
                inputRef={eventTypeRef}
                variant="outlined"
                error={Boolean(formErrors["eventType"])}
                helperText={formErrors["eventType"]}
                onChange={handleInputChange}
                name="eventType"
              />
            </Grid>
            <Grid item xl={3} md={3} sm={6} xs={12}>
              <TextField
                fullWidth
                color="secondary"
                label="Tickets amount"
                inputRef={eventTicketAmountRef}
                variant="outlined"
                type="number"
                error={Boolean(formErrors["eventTicketAmount"])}
                helperText={formErrors["eventTicketAmount"]}
                onChange={handleInputChange}
                name="eventTicketAmount"
              />
            </Grid>
            <Grid item xl={3} md={3} sm={6} xs={12}>
              <TextField
                fullWidth
                color="secondary"
                label="Tickets Price"
                inputRef={eventTicketPriceRef}
                variant="outlined"
                type="number"
                error={Boolean(formErrors["eventTicketPrice"])}
                helperText={formErrors["eventTicketPrice"]}
                onChange={handleInputChange}
                name="eventTicketPrice"
              />
            </Grid>
            <Grid item xl={12} md={12} sm={12} xs={12}>
              <TextField
                fullWidth
                multiline
                color="secondary"
                label="Description"
                inputRef={eventDescriptionRef}
                variant="outlined"
                onChange={handleInputChange}
                name="eventDescription"
              />
            </Grid>
          </Grid>

        </Grid>
      </Grid>
      {formErrors["general"] && (
        <Typography
          variant="body2"
          color="error"
          align="center"
          gutterBottom
        >
          {formErrors["general"]}
        </Typography>
      )}
      <Grid container justifyContent="space-around">
        <Grid item xs={1}>
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            onClick={handleDiscard}
          >
            Discard
          </Button>
        </Grid>
        <Grid item xs={2}>
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            onClick={handleEventCreation}
          >
            Submit
          </Button>
        </Grid>
      </Grid>
    </>
  );
};
