import { FC, ReactNode } from "react";
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
  CircularProgress,
  Typography,
  TableCellProps,
} from "@mui/material";

export interface TableColumn<T = any> {
  id: keyof T;
  label: string;
  align?: TableCellProps["align"];
  render?: (value: any, row: T) => ReactNode;
  width?: string;
}

interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  pagination?: {
    total: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rows: number) => void;
  };
  emptyMessage?: string;
}

export const Table: FC<TableProps> = ({
  columns,
  data,
  onRowClick,
  isLoading = false,
  pagination,
  emptyMessage = "No data available",
}) => {
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="textSecondary">{emptyMessage}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer component={Paper}>
        <MuiTable>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              {columns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align || "left"}
                  width={column.width}
                  sx={{ fontWeight: 600 }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow
                key={index}
                onClick={() => onRowClick?.(row)}
                sx={{
                  cursor: onRowClick ? "pointer" : "default",
                  "&:hover": onRowClick ? { backgroundColor: "#f5f5f5" } : {},
                }}
              >
                {columns.map((column) => (
                  <TableCell
                    key={String(column.id)}
                    align={column.align || "left"}
                  >
                    {column.render
                      ? column.render(row[column.id], row)
                      : String(row[column.id])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </MuiTable>
      </TableContainer>

      {pagination && (
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={pagination.total}
          rowsPerPage={pagination.rowsPerPage}
          page={pagination.page}
          onPageChange={(_, page) => pagination.onPageChange(page)}
          onRowsPerPageChange={(e) =>
            pagination.onRowsPerPageChange(parseInt(e.target.value, 10))
          }
        />
      )}
    </Box>
  );
};
