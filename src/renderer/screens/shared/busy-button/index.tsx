import { Button, ButtonProps, CircularProgress } from '@mui/material';
import React from 'react';

type BusyButtonProps = ButtonProps & {
  busy: boolean;
  busyLabel?: string;
};

function BusyButton({ busy, busyLabel, children, ...props }: BusyButtonProps) {
  return (
    <Button
      {...props}
      disabled={busy || props.disabled}
      startIcon={
        busy ? <CircularProgress size={16} color="inherit" /> : props.startIcon
      }
    >
      {(busy && busyLabel) || children}
    </Button>
  );
}

export default BusyButton;
