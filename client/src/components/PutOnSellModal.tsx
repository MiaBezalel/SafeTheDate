import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface PurchaseSummaryModalProps {
  eventName: string;
  sellPrice: number;
  commission: number;
  image: string;
  isOnMarket: boolean;
  onClose: () => void;
  onPutOnSell: () => void;
}

const PurchaseSummaryModal: React.FC<PurchaseSummaryModalProps> = ({
  eventName,
  sellPrice,
  commission,
  image,
  isOnMarket,
  onClose,
  onPutOnSell,
}) => {
  return (
    <Dialog open={true} onClose={onClose}>
      <DialogTitle>
        Sell Summary
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box display="flex" justifyContent="center" mb={2}>
          <img src={image} alt={eventName} style={{ width: '100%', maxWidth: '300px' }} />
        </Box>
        <DialogContentText>
          Event Name: {eventName}
        </DialogContentText>
        <DialogContentText>
          Sell Price: {sellPrice} NIS
        </DialogContentText>
        <DialogContentText>
          Commission: {commission} NIS
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="secondary">
          Close
        </Button>
        <Button onClick={onPutOnSell} variant="contained" color="primary">
          {`Put ${isOnMarket ? "off" : "on"} Sell`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PurchaseSummaryModal;
