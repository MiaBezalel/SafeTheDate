import { createTheme } from "@mui/material/styles";

export const primary = "#D9D9D9";
export const secondary = "#BE9E45";
export const background = "#1A1A1A";

const success = "#50dc63";
const error = "#EB8282";
const warning = "#f1c73f";

const theme = createTheme({
  palette: {
    tonalOffset: 0.4,
    background: {
      default: background,
      paper: primary,
    },
    primary: {
      main: primary,
    },
    secondary: {
      main: secondary,
    },
    success: {
      main: success,
    },
    error: {
      main: error,
    },
    warning: {
      main: warning,
    },
    action: {
      active: primary,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "@global": {
          "*::-webkit-scrollbar": {
            width: "2px",
          },
          "*::-webkit-scrollbar-track": {
            "-webkit-box-shadow": "inset 0 0 6px rgba(0,0,0,0.00)",
          },
          "*::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,.1)",
            outline: "1px solid slategrey",
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 0,
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        grouped: ({ theme }) => ({
          margin: theme.spacing(1.5),
          border: 0,
          "&.Mui-disabled": {
            border: 0,
          },
          "&:not(:first-of-type)": {
            borderRadius: theme.shape.borderRadius,
          },
          "&:first-of-type": {
            borderRadius: theme.shape.borderRadius,
          },
        }),
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          ":hover": {
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.text.primary,
          },
        }),
      },
      defaultProps: {
        disableRipple: true,
        disableTouchRipple: true,
        disableFocusRipple: true,
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        outlined: ({ theme }) => ({
          color: theme.palette.primary.main,
          border: `1px solid ${theme.palette.primary.dark}`,
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&:hover fieldset': {
            borderColor: `${theme.palette.primary.main} !important`,
          },
          '&.Mui-focused fieldset': {
            borderColor: `${theme.palette.secondary.main} !important`,
          }
        }),
        colorSecondary: ({ theme }) => ({
          color: theme.palette.background.paper,
        }),
        notchedOutline: ({ theme }) => ({
          color: theme.palette.primary.main,
          borderColor: theme.palette.primary.dark,
        }),
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.primary.main,
        }),
      },
      //.css-woy6y0-MuiInputBase-root-MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline
    },
    MuiInputBase: {
      styleOverrides: {
        root: {},
      },
    },
  },
});

export default theme;
