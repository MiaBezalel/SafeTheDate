import { Button, Grid } from "@mui/material";
import { RoutePaths } from "../../App";
import { Logout } from "@mui/icons-material";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import NavigationTypography from "./NavigationTypography/NavigationTypography";
import { useAuth } from "../../hooks/authController/AuthContext";
import { useSnackbar } from "notistack";

const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser, signOut, checkIfSessionValid } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const handleConnect = async () => {
    try {
      if (!currentUser) navigate(RoutePaths.LOGIN);
      else {
        try {
          await signOut();
          enqueueSnackbar("Successful sign out!", { variant: "success" });
          navigate("/");
        } catch (err) {
          enqueueSnackbar("could not sign out, please try again later!", {
            variant: "error",
          });
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Grid
      container
      justifyContent={"space-between"}
      alignItems={"center"}
      textAlign={"center"}
      sx={(theme) => ({
        background: theme.palette.background.default,
        height: "10%",
        position: "sticky",
        top: 0,
        zIndex: 100,
      })}
    >
      <Grid item xs={2}>
        <img
          style={{ width: "100%", maxWidth: "200px", height: "auto", cursor: "pointer" }}
          src={logo}
          alt="fireSpot"
          onClick={() => navigate(RoutePaths.EVENTS)}
        />
      </Grid>
      <Grid item xs>
        <NavigationTypography route={RoutePaths.EVENTS}>
          Events
        </NavigationTypography>
      </Grid>
      <Grid item xs>
        {currentUser ? (
          <NavigationTypography route={RoutePaths.CREATE_EVENT}>
            Create Events
          </NavigationTypography>
        ) : (
          <></>
        )}
      </Grid>
      <Grid item xs>
        {currentUser ? (
          <NavigationTypography route={RoutePaths.IMPORT_TICKET}>
            Import Tickets
          </NavigationTypography>
        ) : (
          <></>
        )}
      </Grid>
      <Grid item xs>
        {currentUser ? (
          <NavigationTypography route={RoutePaths.MY_DETAILS}>
            Profile
          </NavigationTypography>
        ) : (
          <></>
        )}
      </Grid>

      <Grid item xs={2} container justifyContent={"center"}>
        <Button
          size="medium"
          variant={"text"}
          onClick={handleConnect}
          endIcon={<Logout />}
        >
          {currentUser ? "Log Out" : "Sign In"}
        </Button>
      </Grid>
    </Grid>
  );
};

export default Navbar;
