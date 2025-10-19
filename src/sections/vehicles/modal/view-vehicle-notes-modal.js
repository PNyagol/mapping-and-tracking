import React from 'react'
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function ViewMehicleNotesModal({ open, handleCloseView, vehicle }) {
  return (
    <Dialog
        open={open}
        onClose={handleCloseView}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {`Vehicle ${vehicle?.reg_number} Notes`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            { vehicle?.notes }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseView}>Close</Button>
        </DialogActions>
    </Dialog>
  )
}
