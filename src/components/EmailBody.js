import { useContext, useEffect } from "react";
import EmailContext from "../context/EmailContext";
import he from "he";
import axios from "axios"; // Import axios for making API calls

export default function EmailBody({ email, selectedData }) {
  const { toggleFavorite, favorites } = useContext(EmailContext);
  const isFavorite = email ? favorites.includes(email.id) : false;
  const decodedBody =
    selectedData && selectedData.body
      ? he.decode(selectedData.body)
      : "No email body available.";

  // Function to update the read status
  const updateReadStatus = async (id) => {
    try {
      await axios.post(`/api/email-status/${id}`, {
        isRead: true,
        id: id,
      });
    } catch (error) {
      console.error("Error updating read status:", error);
    }
  };

  // Update the read status when the component mounts
  useEffect(() => {
    if (selectedData && selectedData.id) {
      updateReadStatus(selectedData.id);
    }
  }, [selectedData]);

  const handleToggleFavorite = async (id) => {
    toggleFavorite(id);

    try {
      const response = await axios.post(
        `/api/email-status/${selectedData.id}`,
        {
          isFavorite: !isFavorite,
          id: selectedData.id,
        }
      );
    } catch (error) {
      console.error("Error updating email status:", error);
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
