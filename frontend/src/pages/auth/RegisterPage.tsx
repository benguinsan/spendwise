import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  CircularProgress,
  Stack,
} from "@mui/material";
import { useRegister } from "@hooks/useAuth";
import { ErrorAlert } from "@components/common/Alerts";

const RegisterPage: FC = () => {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      await registerMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    }
  };

  return (
    <Box sx={{ textAlign: "center" }}>
      <Typography
        variant="h4"
        sx={{ mb: 1, fontWeight: 700, color: "#1a1d2e" }}
      >
        Create Account
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: "#888" }}>
        Join SpendWise and manage your finances
      </Typography>

      {error && (
        <ErrorAlert
          message={error}
          onClose={() => setError(null)}
          sx={{ mb: 2 }}
        />
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            disabled={registerMutation.isPending}
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            disabled={registerMutation.isPending}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            disabled={registerMutation.isPending}
          />
          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            disabled={registerMutation.isPending}
          />
          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            disabled={registerMutation.isPending}
            sx={{ mt: 2 }}
          >
            {registerMutation.isPending ? (
              <CircularProgress size={24} />
            ) : (
              "Create Account"
            )}
          </Button>
        </Stack>
      </form>

      <Typography variant="body2" sx={{ mt: 3, color: "#666" }}>
        Already have an account?{" "}
        <Link
          href="/login"
          sx={{
            fontWeight: 600,
            color: "#667eea",
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Sign in
        </Link>
      </Typography>
    </Box>
  );
};

export default RegisterPage;
