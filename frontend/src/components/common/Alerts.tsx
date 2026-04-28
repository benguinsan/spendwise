import { FC } from "react";
import { Alert, AlertTitle, AlertProps } from "@mui/material";

interface ErrorAlertProps extends Omit<AlertProps, "children"> {
  title?: string;
  message: string;
  onClose?: () => void;
}

export const ErrorAlert: FC<ErrorAlertProps> = ({
  title = "Error",
  message,
  onClose,
  ...props
}) => {
  return (
    <Alert severity="error" onClose={onClose} sx={{ mb: 2 }} {...props}>
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  );
};

interface SuccessAlertProps extends Omit<AlertProps, "children"> {
  title?: string;
  message: string;
  onClose?: () => void;
}

export const SuccessAlert: FC<SuccessAlertProps> = ({
  title = "Success",
  message,
  onClose,
  ...props
}) => {
  return (
    <Alert severity="success" onClose={onClose} sx={{ mb: 2 }} {...props}>
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  );
};

interface WarningAlertProps extends Omit<AlertProps, "children"> {
  title?: string;
  message: string;
  onClose?: () => void;
}

export const WarningAlert: FC<WarningAlertProps> = ({
  title = "Warning",
  message,
  onClose,
  ...props
}) => {
  return (
    <Alert severity="warning" onClose={onClose} sx={{ mb: 2 }} {...props}>
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  );
};
