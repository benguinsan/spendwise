import { FC, ReactNode } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogProps,
} from "@mui/material";

interface CustomModalProps extends Omit<DialogProps, "children"> {
  title: string;
  children: ReactNode;
  onClose: () => void;
  onConfirm?: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: "default" | "delete" | "warning";
}

export const Modal: FC<CustomModalProps> = ({
  title,
  children,
  onClose,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  variant = "default",
  ...props
}) => {
  const getConfirmColor = (): "error" | "warning" | "primary" => {
    switch (variant) {
      case "delete":
        return "error";
      case "warning":
        return "warning";
      default:
        return "primary";
    }
  };

  return (
    <Dialog onClose={onClose} {...props} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        {onConfirm && (
          <Button
            onClick={onConfirm}
            color={getConfirmColor()}
            variant="contained"
            disabled={isLoading}
          >
            {confirmText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
