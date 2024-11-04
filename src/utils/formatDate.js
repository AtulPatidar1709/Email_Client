import { format } from "date-fns";

export const formatDate = (date) => {
  if (!date) return ""; // Handle cases where date might be undefined or null

  const utcDate = new Date(date); // Create date object directly
  // Use format function from date-fns to return formatted string
  return format(utcDate, "dd/MM/yyyy hh:mm a");
};
