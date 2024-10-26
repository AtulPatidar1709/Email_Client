"use client";
import { useContext, useEffect, useState } from "react";
import EmailContext from "../context/EmailContext";
import he from "he";
import axios from "axios";

export default function EmailBody({ email, selectedData }) {
  const { toggleFavorite, favorites } = useContext(EmailContext);
  const [isFavorite, setIsFavorite] = useState(
    selectedData?.isFavorite || false
  );

  const decodedBody = selectedData?.body
    ? he.decode(selectedData.body)
    : "No email body available.";

  // // Function to update the read status
  // const updateReadStatus = async (id) => {
  //   try {
  //     if (!selectedData.isRead) {
  //       await axios.post(
  //         `/api/email/${id}`,
  //         {
  //           isRead: true,
  //           id: id,
  //         },
  //         {
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error updating read status:", error);
  //   }
  // };

  // Update the read status when the component mounts
  // useEffect(() => {
  //   if (selectedData?.id) {
  //     updateReadStatus(selectedData.id);
  //   }
  // }, [selectedData]);

  const handleToggleFavorite = async (id) => {
    try {
      const newFavoriteStatus = !isFavorite;
      await axios.post(
        `/api/email/${id}`,
        {
          id: id,
          isRead: selectedData.isRead, // Maintain the current read status
          isFavorite: newFavoriteStatus,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setIsFavorite(newFavoriteStatus); // Update local state
      toggleFavorite(id); // Update global context state if needed
    } catch (error) {
      console.error("Error updating email favorite status:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-[var(--border-color)]">
      <div className="flex items-center pb-2">
        <div className="bg-[#E54065] rounded-full h-12 w-12 flex items-center justify-center text-xl font-semibold text-[#F2F2F2]">
          {selectedData?.from.charAt(0).toUpperCase()}
        </div>
        <div className="flex-grow pl-4">
          <h2 className="sm:text-xs md:text-lg font-bold text-[#636363]">
            {selectedData?.subject}
          </h2>
        </div>
        {selectedData && (
          <button
            className={`p-2 rounded-md ${
              isFavorite
                ? "bg-[#E54065] text-white"
                : "bg-gray-200 text-gray-800"
            }`}
            onClick={() => handleToggleFavorite(selectedData.id)}
          >
            {isFavorite ? "Remove Favorite" : "Mark as Favorite"}
          </button>
        )}
      </div>
      <div className="py-2 font-medium">
        <p>{selectedData?.date}</p>
      </div>
      <div className="pb-4 font-medium">
        <div dangerouslySetInnerHTML={{ __html: decodedBody }} />
      </div>
    </div>
  );
}
