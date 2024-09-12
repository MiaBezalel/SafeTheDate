import React, { useState } from 'react';
import Card from "@mui/material/Card";
import {
  Avatar,
  Box,
  CardContent,
  CardHeader,
  CardMedia,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SellIcon from "@mui/icons-material/Sell";

const TICKET_HEIGHT = '20rem';

interface EventCardProps {
  header: string;
  subheader: string;
  title: string;
  image?: string;
  ticketsAmount?: number
  ticketPrice?: number
  onClick?: () => void;
  menuItems?: { label: string; onClick: () => void }[];
  id: string;
  isOnMarket?: boolean;
}

const EventCard = ({
  header,
  title,
  ticketsAmount,
  ticketPrice,
  image = "https://thumbs.dreamstime.com/b/nightclub-party-lightshow-18331890.jpg",
  subheader,
  onClick,
  menuItems,
  isOnMarket = false
}: EventCardProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (itemOnClick: () => void) => {
    return () => {
      itemOnClick();
      handleMenuClose();
    };
  };

  return (
    <Box padding={1}>
      <Card onClick={onClick}
        sx={{ borderRadius: '10px', cursor: onClick ? "pointer" : "default" }}>
        <CardHeader
          avatar={
            <Avatar sx={(theme) => ({ bgcolor: theme.palette.secondary.main })}>
              {title.charAt(0)}
            </Avatar>
          }
          subheaderTypographyProps={{
            noWrap: true
          }}
          titleTypographyProps={{
            noWrap: true
          }}
          title={header}
          subheader={subheader}
          action={
            <>
              {<SellIcon sx={{ verticalAlign: 'middle', color: '#4273dc', visibility: `${isOnMarket ? 'visible' : 'hidden'} ` }} />}
              {menuItems && <IconButton
                onClick={handleMenuOpen}
                sx={{ ml: "auto", color: "black" }}
              >
                <MoreVertIcon />
              </IconButton>}
            </>
          }
        />
        < CardContent >
          <Typography variant="h5" align="center" noWrap>
            {title}
          </Typography>
          {
            !menuItems && <Typography variant="body1" align={"center"}>
              {ticketsAmount ? (ticketsAmount + ' tickets avilable ' + (ticketPrice && ticketPrice + ' NIS')) : 'No tickets avilable'}
            </Typography>
          }

        </CardContent >
        <CardMedia sx={{ height: TICKET_HEIGHT }} image={image} />
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          {menuItems?.map((item) => (
            <MenuItem
              key={item.label}
              onClick={handleMenuItemClick(item.onClick)}
            >
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </Card >
    </Box >
  );
};

export default EventCard;
