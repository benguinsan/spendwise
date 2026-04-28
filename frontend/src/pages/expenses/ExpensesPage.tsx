import { FC, useState } from "react";
import {
  Card,
  CardContent,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useAuthStore } from "@stores/auth.store";
import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from "@hooks/useTransactions";
import { useWallets } from "@hooks/useWallets";
import { useCategories } from "@hooks/useCategories";
import { Table, TableColumn } from "@components/common/Table";
import { Modal } from "@components/common/Modal";
import { LoadingSpinner } from "@components/common/LoadingSpinner";
import { formatCurrency, formatDate } from "@utils/formatters";
import { Transaction, CreateTransactionRequest } from "@types";

const ExpensesPage: FC = () => {
  const { user } = useAuthStore();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CreateTransactionRequest>>({
    type: "EXPENSE",
    amount: 0,
    note: "",
  });

  const { data: txData = { data: [], total: 0 }, isLoading: txLoading } =
    useTransactions(
      { userId: user?.id, skip: page * rowsPerPage, take: rowsPerPage },
      { enabled: !!user?.id },
    );
  const { data: wallets } = useWallets(user?.id);
  const { data: categoriesData } = useCategories("EXPENSE");

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  const handleOpenModal = (transaction?: Transaction) => {
    if (transaction) {
      setEditingId(transaction.id);
      setFormData({
        amount: transaction.amount,
        note: transaction.note,
        type: transaction.type,
        categoryId: transaction.categoryId,
        walletId: transaction.walletId,
      });
    } else {
      setEditingId(null);
      setFormData({ type: "EXPENSE", amount: 0, note: "" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ type: "EXPENSE", amount: 0, note: "" });
  };

  const handleSubmit = async () => {
    if (!user?.id || !formData.walletId || !formData.amount) return;

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          data: {
            amount: formData.amount,
            note: formData.note,
            categoryId: formData.categoryId,
          },
        });
      } else {
        await createMutation.mutateAsync({
          userId: user.id,
          amount: formData.amount || 0,
          type: formData.type as any,
          note: formData.note || "",
          walletId: formData.walletId,
          categoryId: formData.categoryId,
          date: new Date().toISOString(),
        });
      }
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save transaction:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  const columns: TableColumn<Transaction>[] = [
    {
      id: "date",
      label: "Date",
      render: (value) => formatDate(value),
    },
    {
      id: "note",
      label: "Description",
    },
    {
      id: "type",
      label: "Type",
    },
    {
      id: "amount",
      label: "Amount",
      align: "right",
      render: (value) => formatCurrency(value),
    },
    {
      id: "id",
      label: "Actions",
      render: (_, row) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => handleOpenModal(row)}>
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            onClick={() => handleDelete(row.id)}
            disabled={deleteMutation.isPending}
          >
            Delete
          </Button>
        </Stack>
      ),
    },
  ];

  if (txLoading) return <LoadingSpinner message="Loading transactions..." />;

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Transactions
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenModal()}
        >
          Add Transaction
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <Table
            columns={columns}
            data={txData?.data || []}
            isLoading={txLoading}
            pagination={{
              total: txData?.total || 0,
              page,
              rowsPerPage,
              onPageChange: setPage,
              onRowsPerPageChange: setRowsPerPage,
            }}
          />
        </CardContent>
      </Card>

      {/* Transaction Modal */}
      <Modal
        open={showModal}
        title={editingId ? "Edit Transaction" : "Add Transaction"}
        onClose={handleCloseModal}
        onConfirm={handleSubmit}
        confirmText={editingId ? "Update" : "Add"}
        isLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Stack spacing={2}>
          <TextField
            label="Amount"
            type="number"
            value={formData.amount || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                amount: parseFloat(e.target.value),
              }))
            }
            fullWidth
          />
          <TextField
            label="Description"
            value={formData.note || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                note: e.target.value,
              }))
            }
            fullWidth
            multiline
            rows={2}
          />
          <TextField
            select
            label="Wallet"
            value={formData.walletId || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                walletId: e.target.value,
              }))
            }
            fullWidth
            SelectProps={{
              native: true,
            }}
          >
            <option value="">Select a wallet</option>
            {wallets?.data?.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </TextField>
          <TextField
            select
            label="Category"
            value={formData.categoryId || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                categoryId: e.target.value,
              }))
            }
            fullWidth
            SelectProps={{
              native: true,
            }}
          >
            <option value="">Select a category</option>
            {categoriesData?.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </TextField>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default ExpensesPage;
