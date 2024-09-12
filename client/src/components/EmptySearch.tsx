import { Typography, useTheme } from "@mui/material";
import noEventsImage from "../assets/search-no-result.jpg";


interface EmptySearchProps {
    message: string;
}

const EmptySearch = (props: EmptySearchProps) => {
    const { message } = props;
    const theme = useTheme();

    return (
        <div style={{ textAlign: "center" }}>
            <img src={noEventsImage} alt="No events" style={{ width: "12rem", height: "12rem" }} />
            <p></p>
            <Typography
                variant="subtitle1"
                sx={{ color: theme.palette.primary.main, fontWeight: 700, typography: { sm: 'h6', md: "h5" } }} >
                {message}
            </Typography>
        </div>
    )
}

export default EmptySearch;