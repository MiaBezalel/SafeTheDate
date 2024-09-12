import { Outlet } from "react-router-dom";
import { Box, Grid, Stack } from "@mui/material";
import NavigationTypography from "../AppBar/NavigationTypography/NavigationTypography";
import { RoutePaths } from "../../App";
import { useAuth } from "../../hooks/authController/AuthContext";

export const Profile = () => {
  const { currentUser } = useAuth();
  return !currentUser ? (
    <div style={{ color: "white", marginTop: "200sx" }}>
      <h1> You Have To Sign In To Watch Your Profile</h1>
      <Grid container component="main" sx={{ height: "75vh" }}>
        <Grid
          item
          sm={9}
          md={15}
          sx={{
            backgroundImage: "url(https://source.unsplash.com/ZnLprInKM7s)",
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light"
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </Grid>
    </div>
  ) : (
    <Box
      sx={(theme) => ({
        bgcolor: theme.palette.background.default,
        display: "flex",
        height: "100%",
      })}
    >
      <Grid container>
        <Grid item xs={3}>
          <Stack alignItems={"center"} spacing={3}>
            <NavigationTypography route={RoutePaths.MY_EVENTS}>
              My Events
            </NavigationTypography>
            <NavigationTypography route={RoutePaths.MY_TICKETS}>
              My Tickets
            </NavigationTypography>
            <NavigationTypography route={RoutePaths.MY_DETAILS}>
              Account Details
            </NavigationTypography>
          </Stack>
        </Grid>
        <Grid item xs={9}>
          <Outlet />
        </Grid>
      </Grid>
    </Box>
  );
};
