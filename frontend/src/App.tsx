import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@stores/auth.store";
import { useCurrentUser } from "@hooks/useAuth";

// Pages
import LoginPage from "@pages/auth/LoginPage";
import RegisterPage from "@pages/auth/RegisterPage";
import DashboardPage from "@pages/dashboard/DashboardPage";
import ExpensesPage from "@pages/expenses/ExpensesPage";
import CategoriesPage from "@pages/categories/CategoriesPage";
import BudgetsPage from "@pages/budgets/BudgetsPage";
import GoalsPage from "@pages/goals/GoalsPage";
import ReportsPage from "@pages/reports/ReportsPage";
import WalletsPage from "@pages/wallets/WalletsPage";

// Layouts
import MainLayout from "@layouts/MainLayout";
import AuthLayout from "@layouts/AuthLayout";
import { LoadingSpinner } from "@components/common/LoadingSpinner";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const { isLoading } = useCurrentUser({ retry: false });

  if (isLoading) {
    return <LoadingSpinner fullHeight message="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AuthLayout>{children}</AuthLayout>;
}

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <ExpensesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <CategoriesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wallets"
        element={
          <ProtectedRoute>
            <WalletsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/budgets"
        element={
          <ProtectedRoute>
            <BudgetsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/goals"
        element={
          <ProtectedRoute>
            <GoalsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
