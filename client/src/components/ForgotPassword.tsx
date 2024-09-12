/* eslint-disable no-debugger */
import * as React from "react";
import { useRef, useState, useEffect } from "react";
import LockOutlinedIcon from "@mui/icons-material/Lock";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { RoutePaths } from "../App";
import { useAuth } from "../hooks/authController/AuthContext";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const ForgotPassword = () => {
  const usernameOrMail: React.MutableRefObject<any> = useRef(null);
  const newPassword: React.MutableRefObject<any> = useRef(null);
  const OneTimecode: React.MutableRefObject<any> = useRef(null);
  const [isMailSent, setIsMailSent] = useState(false);
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { resetPasswordSendMail, resetPassword } = useAuth();

  const sendResetPassword = async () => {
    try {
      await resetPasswordSendMail(usernameOrMail.current.value);
      setIsMailSent(true);
      enqueueSnackbar("Successful send email!", { variant: "success" });
    } catch (error: any) {
      console.log(error.response);
      enqueueSnackbar("Email failed: " + error, { variant: "error" });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      email: data.get("email"),
      newPassword: data.get("newPassword"),
    });
    try {
      await resetPassword(
        data.get("newPassword") as string,
        data.get("OneTimecode") as string
      );
      enqueueSnackbar("Successful reset!", { variant: "success" });
      navigate("/login");
    } catch (error: any) {
      console.log(error);
      enqueueSnackbar("Reset failed: " + error, { variant: "error" });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: "url(https://source.unsplash.com/PgP9L5CWI38)",
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light"
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <Grid
          item
          xs={12}
          sm={8}
          md={5}
          component={Paper}
          elevation={6}
          square
          sx={{
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light"
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h1>The Party Begins Here!</h1>
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Forgot Password
            </Typography>
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{ mt: 1 }}
            >
              {!isMailSent ? (
                <>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="usernameOrMail"
                    inputRef={usernameOrMail}
                    label="Email Address"
                    name="usernameOrMail"
                    placeholder="Enter email or username"
                    autoComplete="email"
                    autoFocus
                  />

                  <Button
                    onClick={sendResetPassword}
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                  >
                    Send code to email
                  </Button>
                </>
              ) : (
                <>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    inputRef={newPassword}
                    name="newPassword"
                    label="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    id="newPassword"
                    autoComplete="current-newPassword"
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    inputRef={OneTimecode}
                    name="OneTimecode"
                    label="OneTimecode"
                    type="text"
                    placeholder="Enter email code"
                    id="OneTimecode"
                    autoComplete="current-OneTimecode"
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                  >
                    Change
                  </Button>
                </>
              )}

              <Grid container>
                <Grid item xs>
                  <Link
                    href={RoutePaths.LOGIN}
                    variant="body1"
                    underline="hover"
                    color="inherit"
                  >
                    Login
                  </Link>
                </Grid>
                <Grid item>
                  <Link
                    href={RoutePaths.SIGNUP}
                    underline="hover"
                    color="inherit"
                    variant="body1"
                  >
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default ForgotPassword;
