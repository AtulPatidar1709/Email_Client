"use client";

import { createContext, useState, useEffect } from "react";
import axios from "axios";

const EmailContext = createContext();

export const EmailProvider = ({ children, userId }) => {
  const [emails, setEmails] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [readEmails, setReadEmails] = useState([]);

  // Fetch favorites and readEmails from the server on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const favoriteResponse = await axios.get(`/api/email-status/${userId}`);
        const readResponse = await axios.get(`/api/email-status/${userId}`);

        setFavorites(favoriteResponse.data.isFavorite || []);
        setReadEmails(readResponse.data.isRead || []);
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    fetchUserData();
  }, [userId]); // Add userId as a dependency

  // Save favorites and readEmails to the server
  useEffect(() => {
    const saveUserData = async () => {
      try {
        await axios.post(`/api/email-status/${userId}`, {
          favorites,
          readEmails,
        });
      } catch (error) {
        console.error("Error saving user data", error);
      }
    };

    if (favorites.length > 0 || readEmails.length > 0) {
      saveUserData();
    }
  }, [favorites, readEmails, userId]); // Add userId as a dependency

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const markAsRead = (id) => {
    if (!readEmails.includes(id)) {
      setReadEmails((prev) => [...prev, id]);
      // Optionally, you can also send a request to update the server
      axios
        .post(`/api/email-status/${id}`, {
          isRead: true, // Mark as read
          id,
        })
        .catch((error) => {
          console.error("Error updating read status", error);
        });
    }
  };

  return (
    <EmailContext.Provider
      value={{
        emails,
        setEmails,
        favorites,
        toggleFavorite,
        readEmails,
        markAsRead,
      }}
    >
      {children}
    </EmailContext.Provider>
  );
};

export default EmailContext;
