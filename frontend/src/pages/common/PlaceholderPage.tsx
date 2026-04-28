import { FC } from "react";
import { Card, CardContent, Typography, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const PlaceholderPage: FC<{
  title: string;
  description: string;
}> = ({ title, description }) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ textAlign: "center", py: 8 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: "#666" }}>
            {description}
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: "#999" }}>
            This feature is under development. Check back soon!
          </Typography>
          <Button variant="contained" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PlaceholderPage;
