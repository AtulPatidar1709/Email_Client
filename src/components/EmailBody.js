"use client";
import { useContext, useEffect, useState } from "react";
import EmailContext from "../context/EmailContext";
import he from "he";
import axios from "axios";
import { formatDate } from "@/utils/formatDate";

export default function EmailBody() {
  const { toggleFavorite, favorites, selectedEmail } = useContext(EmailContext);
  const [isFavorite, setIsFavorite] = useState(
    selectedEmail?.isFavorite || false
  );

  const decodedBody = selectedEmail?.body
    ? he.decode(selectedEmail.body)
    : "No email body available.";

  const handleToggleFavorite = async (selectedEmail) => {
    try {
      setIsFavorite(!selectedEmail.isFavorite); // Update local state
      toggleFavorite(selectedEmail.emailId); // Update global context state if needed
    } catch (error) {
      console.error("Error updating email favorite status:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-[var(--border-color)]">
      <div className="flex items-center pb-2">
        <div className="bg-[#E54065] rounded-full h-12 w-12 flex items-center justify-center text-xl font-semibold text-[#F2F2F2]">
          {selectedEmail?.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-grow pl-4">
          <h2 className="sm:text-xs pb-2 md:text-lg font-bold text-[#636363]">
            {selectedEmail?.subject}
          </h2>
          <p>{formatDate(selectedEmail.createdAt)}</p>
        </div>
        {selectedEmail && (
          <button
            className={`px-[15px] text-xs sm:text-base py-[5px] rounded-full border-2 border-black ${
              isFavorite
                ? "bg-[#E54065] text-white"
                : "bg-gray-200 text-gray-800"
            }`}
            onClick={() => handleToggleFavorite(selectedEmail)}
          >
            {isFavorite ? "Remove Favorite" : "Mark as Favorite"}
          </button>
        )}
      </div>
      <div className="py-2 font-medium">
        <p>{selectedEmail?.date}</p>
      </div>
      <div className="pb-4 font-medium">
        <div dangerouslySetInnerHTML={{ __html: decodedBody }} />
      </div>
    </div>
  );
}
