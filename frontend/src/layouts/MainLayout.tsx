import { FC, ReactNode, useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Container,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Dashboard,
  Receipt,
  Category,
  AccountBalance,
  TrendingUp,
  BarChart,
  Logout,
  Settings,
} from "@mui/icons-material";
import { useAuthStore } from "@stores/auth.store";
import { useLogout } from "@hooks/useAuth";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const logoutMutation = useLogout();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Dashboard },
    { path: "/expenses", label: "Expenses", icon: Receipt },
    { path: "/categories", label: "Categories", icon: Category },
    { path: "/wallets", label: "Wallets", icon: AccountBalance },
    { path: "/budgets", label: "Budgets", icon: TrendingUp },
    { path: "/goals", label: "Goals", icon: TrendingUp },
    { path: "/reports", label: "Reports", icon: BarChart },
  ];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    try {
      await logoutMutation.mutateAsync();
      navigate("/login");
    } catch (error) {
      logout();
      navigate("/login");
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 280,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 280,
            boxSizing: "border-box",
            backgroundColor: "#1a1d2e",
            color: "white",
          },
        }}
      >
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#667eea" }}>
            SpendWise
          </Typography>
          <Typography variant="caption" sx={{ color: "#888" }}>
            Financial Management
          </Typography>
        </Box>

        <List sx={{ flex: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    backgroundColor: isActive
                      ? "rgba(102, 126, 234, 0.1)"
                      : "transparent",
                    borderRight: isActive ? "4px solid #667eea" : "none",
                    "&:hover": {
                      backgroundColor: "rgba(102, 126, 234, 0.05)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{ color: isActive ? "#667eea" : "#888", minWidth: 40 }}
                  >
                    <Icon />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    sx={{
                      color: isActive ? "#fff" : "#888",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* User Profile Section */}
        <Box sx={{ p: 2, borderTop: "1px solid #333" }}>
          <ListItemButton
            onClick={handleMenuOpen}
            sx={{
              borderRadius: 1,
              "&:hover": { backgroundColor: "rgba(102, 126, 234, 0.1)" },
            }}
          >
            <Avatar
              sx={{ width: 32, height: 32, mr: 1, backgroundColor: "#667eea" }}
            >
              {user?.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#fff" }}
              >
                {user?.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "#888" }} noWrap>
                {user?.email}
              </Typography>
            </Box>
          </ListItemButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            transformOrigin={{ vertical: "bottom", horizontal: "left" }}
          >
            <MenuItem onClick={handleMenuClose}>
              <Settings sx={{ mr: 1 }} fontSize="small" />
              Settings
            </MenuItem>
            <MenuItem
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <Logout sx={{ mr: 1 }} fontSize="small" />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <AppBar
          position="static"
          sx={{
            backgroundColor: "#fff",
            color: "#333",
            boxShadow: "none",
            borderBottom: "1px solid #eee",
          }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ flex: 1 }}>
              {navItems.find((item) => item.path === location.pathname)
                ?.label || "Dashboard"}
            </Typography>
          </Toolbar>
        </AppBar>

        <Box
          sx={{ flex: 1, backgroundColor: "#f9fafb", p: 3, overflowY: "auto" }}
        >
          <Container maxWidth="xl">{children}</Container>
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
