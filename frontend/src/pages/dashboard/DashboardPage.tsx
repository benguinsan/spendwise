import { FC, useMemo } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, TrendingDown, Wallet, Receipt } from "@mui/icons-material";
import { useAuthStore } from "@stores/auth.store";
import { useUserTransactions } from "@hooks/useTransactions";
import { useUserWallets } from "@hooks/useWallets";
import { StatCard } from "@components/common/StatCard";
import { LoadingSpinner } from "@components/common/LoadingSpinner";
import { formatCurrency } from "@utils/formatters";

const DashboardPage: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: transactions = [], isLoading: transLoading } =
    useUserTransactions(user?.id || "");
  const { data: wallets = [], isLoading: walletsLoading } = useUserWallets(
    user?.id || "",
  );

  const stats = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((t) => {
      if (t.type === "INCOME") totalIncome += t.amount;
      else if (t.type === "EXPENSE") totalExpense += t.amount;
    });

    const totalWalletBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

    return {
      totalIncome,
      totalExpense,
      totalWalletBalance,
      transactionCount: transactions.length,
    };
  }, [transactions, wallets]);

  const categoryData = useMemo(() => {
    const grouped: Record<string, number> = {};
    transactions.forEach((t) => {
      if (t.type === "EXPENSE" && t.categoryId) {
        grouped[t.categoryId] = (grouped[t.categoryId] || 0) + t.amount;
      }
    });

    return Object.entries(grouped).map(([category, amount]) => ({
      name: category,
      value: amount,
    }));
  }, [transactions]);

  const COLORS = ["#667eea", "#764ba2", "#f093fb", "#4facfe", "#43e97b"];

  if (transLoading || walletsLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <Stack spacing={3}>
      {/* Stats Cards */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Income"
            value={formatCurrency(stats.totalIncome)}
            icon={TrendingUp}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Expenses"
            value={formatCurrency(stats.totalExpense)}
            icon={TrendingDown}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Wallet Balance"
            value={formatCurrency(stats.totalWalletBalance)}
            icon={Wallet}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Transactions"
            value={stats.transactionCount}
            icon={Receipt}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={2}>
        {/* Expense by Category Pie Chart */}
        {categoryData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Expenses by Category
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) =>
                        `${name}: ${formatCurrency(value)}`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Income vs Expense Comparison */}
        <Grid item xs={12} md={categoryData.length > 0 ? 6 : 12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Income vs Expenses
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={[
                    {
                      name: "Monthly",
                      income: stats.totalIncome,
                      expense: stats.totalExpense,
                    },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#10b981" name="Income" />
                  <Bar dataKey="expense" fill="#ef4444" name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Transactions & Quick Actions */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Recent Transactions
              </Typography>
              <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
                {transactions.slice(0, 5).map((t) => (
                  <Box
                    key={t.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      py: 1.5,
                      borderBottom: "1px solid #eee",
                      "&:last-child": { borderBottom: "none" },
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {t.note}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#888" }}>
                        {t.type}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: t.type === "INCOME" ? "#10b981" : "#ef4444",
                      }}
                    >
                      {t.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(t.amount)}
                    </Typography>
                  </Box>
                ))}
                {transactions.length === 0 && (
                  <Typography
                    variant="body2"
                    sx={{ color: "#888", textAlign: "center", py: 2 }}
                  >
                    No transactions yet
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Quick Actions
              </Typography>
              <Stack spacing={1}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate("/expenses")}
                >
                  Add Transaction
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate("/wallets")}
                >
                  Manage Wallets
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate("/budgets")}
                >
                  Set Budget
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate("/reports")}
                >
                  View Reports
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default DashboardPage;
