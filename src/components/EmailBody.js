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
    <div className="flex bg-white pb-4 px-4">
      <div className="hidden md:flex w-auto pr-4 justify-start">
        <div className="bg-[#E54065] rounded-full h-12 w-12 flex items-center justify-center text-xl font-semibold text-[#F2F2F2]">
          {selectedEmail?.name.charAt(0).toUpperCase()}
        </div>
      </div>
      <div className="flex flex-col w-full">
        <div className="flex justify-between pb-4">
          <div className="flex">
            <div className="flex-grow pl-4">
              <h2 className="sm:text-lg pb-2 md:text-xl font-bold text-[#636363]">
                {selectedEmail?.subject}
              </h2>
              <p>{formatDate(selectedEmail.createdAt)}</p>
            </div>
            <div className="py-2 font-medium">
              <p>{selectedEmail?.date}</p>
            </div>
          </div>
          {selectedEmail && (
            <button
              className={`px-[5px] my-2 text-xs sm:text-base py-[2px] rounded-full border-2 border-black ${
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
        <div className="pb-2 font-medium">
          <div dangerouslySetInnerHTML={{ __html: decodedBody }} />
        </div>
      </div>
    </div>
  );
}
