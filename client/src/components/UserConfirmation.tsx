import { Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import backendAPI from "../api";
import { useSnackbar } from "notistack";

const UserConfirmation = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const confirmation = queryParams.get("confirmation");
  const { enqueueSnackbar } = useSnackbar();
  const [isSuccess, setIsSuccess] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      if (confirmation) {
        try {
          const user = await backendAPI.auth.confirmMail(confirmation);
          if (user) {
            setIsSuccess(true);
            enqueueSnackbar("Email confirmed successfully!", {
              variant: "success",
            });
          } else {
            enqueueSnackbar(
              "Something went wrong while trying to confirm your email...",
              {
                variant: "error",
              }
            );
          }
        } catch (err) {
          console.log(err);
          enqueueSnackbar(
            "Something went wrong while trying to confirm your email...",
            {
              variant: "error",
            }
          );
        }
      } else {
        enqueueSnackbar("confirmation id cannot be empty", {
          variant: "error",
        });
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {isSuccess ? (
        <Typography variant="h3" align="center" gutterBottom color={"white"}>
          Email confirmed successfully!
        </Typography>
      ) : (
        <Typography variant="h4" align="center" gutterBottom color={"white"}>
          Loading...
        </Typography>
      )}
    </>
  );
};

export default UserConfirmation;
