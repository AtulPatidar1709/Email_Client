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
        const response = await axios.get(`/api/email-status/${userId}`);

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

    if ((favorites.length > 0 || readEmails.length > 0) && userId) {
      saveUserData();
    }
  }, [favorites, readEmails, userId]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const markAsRead = (id) => {
    if (!readEmails.includes(id)) {
      setReadEmails((prev) => [...prev, id]);

      // Optionally, you can also send a request to update the server immediately
      axios
        .post(`/api/email-status/${userId}`, {
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
