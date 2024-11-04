"use client";
import { createContext, useState, useEffect } from "react";
import axios from "axios";

const EmailContext = createContext();

export const EmailProvider = ({ children, userId }) => {
  const [favorites, setFavorites] = useState([]);
  const [readEmails, setReadEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);

  // Fetch favorites and readEmails from the server on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`/api/email/${userId}`);
        setFavorites(response.data.favorites || []);
        setReadEmails(response.data.readEmails || []);
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const selectEmail = async (email) => {
    try {
      const response = await axios.get(`/api/email/${email.emailId}`);
      setSelectedEmail({ ...email, body: response.data.email.body });
      markAsRead(email.emailId, email.isFavorite);
    } catch (error) {
      console.error("Error fetching email details:", error);
    }
  };

  const toggleFavorite = async (id) => {
    const isCurrentlyFavorite = selectedEmail.isFavorite;
    const newFavoriteStatus = !isCurrentlyFavorite;

    setFavorites((prev) =>
      newFavoriteStatus ? [...prev, id] : prev.filter((fav) => fav !== id)
    );

    try {
      await axios.post(
        `/api/email/${id}`,
        {
          id: id,
          isRead: selectedEmail.isRead, // Maintain the current read status
          isFavorite: newFavoriteStatus,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Update the selected email's favorite status in state
      setSelectedEmail((prevEmail) => ({
        ...prevEmail,
        isFavorite: newFavoriteStatus,
      }));

      // Refetch the email to ensure the state is consistent
      selectEmail(selectedEmail);
    } catch (error) {
      console.error("Error updating email favorite status:", error);
    }
  };

  const markAsRead = (id, isFavorite) => {
    if (!readEmails.includes(id)) {
      setReadEmails((prev) => [...prev, id]);
      axios
        .post(`/api/email/${userId}`, { id, isRead: true, isFavorite })
        .catch((error) => console.error("Error updating read status", error));
    }
  };

  return (
    <EmailContext.Provider
      value={{
        favorites,
        toggleFavorite,
        readEmails,
        markAsRead,
        selectedEmail,
        setSelectedEmail,
        selectEmail,
      }}
    >
      {children}
    </EmailContext.Provider>
  );
};

export default EmailContext;
