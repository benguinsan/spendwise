import { format, parseISO } from "date-fns";

export const formatCurrency = (
  amount: number,
  currency: string = "USD",
): string => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(amount);
};

export const formatNumber = (num: number, decimals = 0): string => {
  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatDate = (
  date: string | Date,
  pattern: string = "MMM dd, yyyy",
): string => {
  if (typeof date === "string") {
    return format(parseISO(date), pattern);
  }
  return format(date, pattern);
};

export const formatDateTime = (date: string | Date): string => {
  if (typeof date === "string") {
    return format(parseISO(date), "MMM dd, yyyy HH:mm");
  }
  return format(date, "MMM dd, yyyy HH:mm");
};

export const formatShortDate = (date: string | Date): string => {
  if (typeof date === "string") {
    return format(parseISO(date), "MMM dd");
  }
  return format(date, "MMM dd");
};

export const calculatePercentage = (current: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + "...";
  }
  return text;
};
