import { FC } from "react";
import { Box, CircularProgress, Typography, Stack } from "@mui/material";

interface LoadingSpinnerProps {
  message?: string;
  fullHeight?: boolean;
}

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({
  message,
  fullHeight = false,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: fullHeight ? "100vh" : "auto",
        p: 4,
      }}
    >
      <Stack spacing={2} alignItems="center">
        <CircularProgress />
        {message && <Typography color="textSecondary">{message}</Typography>}
      </Stack>
    </Box>
  );
};
