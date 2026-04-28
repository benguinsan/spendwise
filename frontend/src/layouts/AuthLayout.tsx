import { FC, ReactNode } from "react";
import { Container, Box } from "@mui/material";

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: FC<AuthLayoutProps> = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            p: 4,
          }}
        >
          {children}
        </Box>
      </Container>
    </Box>
  );
};

export default AuthLayout;
