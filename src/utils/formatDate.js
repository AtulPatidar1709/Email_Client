import { format } from "date-fns";

export const formatDate = (date) => {
  const utcDate = new Date(date).toISOString(); // Use ISO string for consistency
  return format(new Date(utcDate), "dd/MM/yyyy hh:mm a");
};
