import React, { useState } from "react";
import { styled, useTheme } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import ChatIcon from "@mui/icons-material/Chat";
import Captain from "./Captain";
import Draggable from "react-draggable";

const ChatButtonContainer = styled("div")`
  position: fixed;
  bottom: ${({ theme }) => theme.spacing(2)};
  left: ${({ theme }) => theme.spacing(2)};
  border-radius: 1rem;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const ChatButtonPrimary = styled(Button)`
  background-color: ${({ theme }) => theme.palette.primary.main};
  color: ${({ theme }) => theme.palette.primary.contrastText};
  box-shadow: 0 0.2rem 0.5rem rgba(0, 0, 0, 0.3);
`;

const ChatButtonSecondary = styled(Button)`
  background-color: ${({ theme }) => theme.palette.secondary.main};
  color: ${({ theme }) => theme.palette.secondary.contrastText};
  box-shadow: 0 0.2rem 0.5rem rgba(0, 0, 0, 0.3);
`;

const ChatPopUp = styled("div")`
  padding: ${({ theme }) => theme.spacing(2)};
  border-radius: 1rem;
  bottom: ${({ theme }) => theme.spacing(2)};
  top: 3.125rem; /* Equivalent to 50 pixels */
  box-shadow: 0 0 0.625rem rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const SideChatbot = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const muiTheme = useTheme();
  let isDragging = false;

  const handleChatClick = (event) => {
    if (isDragging) return;

    setAnchorEl(event.currentTarget);
  };

  const handleChatClose = () => {
    setAnchorEl(null);
  };

  const onDrag = () => {
    isDragging = true;
  }
  const onStop = () => {
    setTimeout(() => (isDragging = false), 0);
  }

  const open = Boolean(anchorEl);
  const id = open ? 'chat-popover' : undefined;

  return (
    <>
      <Draggable onStop={onStop} onDrag={onDrag}>
        <ChatButtonContainer theme={muiTheme}>
          <ChatButtonPrimary
            onClick={handleChatClick}
            variant="contained"
            startIcon={<ChatIcon />}>
            Chat With The Captain
          </ChatButtonPrimary>
        </ChatButtonContainer>
      </Draggable>
      <Popover
        sx={{ '& .MuiPaper-root': { borderRadius: '10px' } }}
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleChatClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <ChatPopUp theme={muiTheme}>
          <div style={{ flex: 1 }}>
            <Captain />
          </div>
        </ChatPopUp>
      </Popover>
    </>
  );
};

export default SideChatbot;
