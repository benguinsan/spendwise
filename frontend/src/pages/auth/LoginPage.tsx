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
import { useLogin } from "@hooks/useAuth";
import { ErrorAlert } from "@components/common/Alerts";

const LoginPage: FC = () => {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      await loginMutation.mutateAsync(formData);
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Login failed. Please try again.",
      );
    }
  };

  return (
    <Box sx={{ textAlign: "center" }}>
      <Typography
        variant="h4"
        sx={{ mb: 1, fontWeight: 700, color: "#1a1d2e" }}
      >
        Welcome Back
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: "#888" }}>
        Sign in to your SpendWise account
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
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            disabled={loginMutation.isPending}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            disabled={loginMutation.isPending}
          />
          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            disabled={loginMutation.isPending}
            sx={{ mt: 2 }}
          >
            {loginMutation.isPending ? (
              <CircularProgress size={24} />
            ) : (
              "Sign In"
            )}
          </Button>
        </Stack>
      </form>

      <Typography variant="body2" sx={{ mt: 3, color: "#666" }}>
        Don't have an account?{" "}
        <Link
          href="/register"
          sx={{
            fontWeight: 600,
            color: "#667eea",
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Sign up
        </Link>
      </Typography>
    </Box>
  );
};

export default LoginPage;
