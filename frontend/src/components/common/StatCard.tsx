import { FC } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  SvgIconProps,
} from "@mui/material";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: FC<SvgIconProps>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "primary" | "success" | "error" | "warning" | "info";
  onClick?: () => void;
}

export const StatCard: FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  color = "primary",
  onClick,
}) => {
  const colorMap = {
    primary: "#2563eb",
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#06b6d4",
  };

  return (
    <Card
      sx={{
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.3s ease",
        "&:hover": onClick
          ? {
              transform: "translateY(-4px)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            }
          : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography color="textSecondary" sx={{ mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              {value}
            </Typography>
            {trend && (
              <Typography
                variant="body2"
                sx={{ color: trend.isPositive ? "#10b981" : "#ef4444" }}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </Typography>
            )}
          </Box>
          {Icon && (
            <Box
              sx={{
                backgroundColor: `${colorMap[color]}20`,
                borderRadius: "8px",
                p: 1.5,
              }}
            >
              <Icon sx={{ color: colorMap[color], fontSize: 24 }} />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
