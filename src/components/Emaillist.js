"use client";

import axios from "axios";
import { Suspense, useContext, useEffect, useRef, useState } from "react";
import EmailBody from "../components/EmailBody.js";
import { formatDate } from "../utils/formatDate.js";
import Loader from "./Loader/page.js";
import EmailContext from "../context/EmailContext";

const EmailList = () => {
  const {
    readEmails,
    toggleFavorite,
    favorites,
    markAsRead,
    selectEmail,
    selectedEmail,
    setSelectedEmail,
  } = useContext(EmailContext);

  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bodyloading, setBodyloading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("all");
  const [dataLength, setDataLength] = useState(0);
  const emailsPerPage = 5;
  const cancelTokenSource = useRef(null); // Ref to hold the cancel token

  useEffect(() => {
    const fetchEmails = async () => {
      setLoading(true);

      try {
        cancelTokenSource.current = axios.CancelToken.source(); // Create a new cancel token
        const response = await axios.get(
          `/api/email?page=${currentPage}&limit=${emailsPerPage}&filter=${filter}`,
          { cancelToken: cancelTokenSource.current.token },
          { cache: "no-store" }
        );

        if (response.status === 200) {
          const { paginatedEmails, totalItems } = response.data;
          setDataLength(totalItems);
          setEmails(paginatedEmails);
          setTotalPages(Math.ceil(totalItems / emailsPerPage));
        } else {
          throw new Error("Failed to fetch emails");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();

    return () => {
      if (cancelTokenSource.current) {
        cancelTokenSource.current.cancel("Operation canceled by the user.");
      }
    };
  }, [currentPage, filter, favorites, readEmails]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleFilterChange = (newFilter) => {
    setSelectedEmail(null);
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleEmailSelect = async (email) => {
    setBodyloading(true);
    try {
      await selectEmail(email);
    } catch (error) {
      console.error("Error fetching selected email:", error);
      setError("Failed to fetch the selected email");
    } finally {
      setBodyloading(false);
    }
  };

  const handleToggleFavorite = async (emailId) => {
    await toggleFavorite(emailId); // Ensure it updates the context state
    // Update the local state immediately
    setEmails((prevEmails) =>
      prevEmails.map((email) =>
        email.emailId === emailId
          ? { ...email, isFavorite: !email.isFavorite } // Toggle favorite status
          : email
      )
    );
  };

  const filteredEmails = emails.filter((email) => {
    if (filter === "read") {
      return email.isRead;
    }
    if (filter === "unread") {
      return !email.isRead;
    }
    if (filter === "favorites") {
      return email.isFavorite;
    }
    return true;
  });

  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <header className="flex flex-wrap items-center justify-start mb-4 pt-4 space-x-1">
        <h4 className="font-semibold">Filter By:</h4>
        {["all", "read", "unread", "favorites"].map((filterType) => (
          <button
            key={filterType}
            onClick={() => handleFilterChange(filterType)}
            className={`px-[10px] md:px-4 py-1 mx-1 rounded-full ${
              filter === filterType ? "bg-gray-200 text-black" : ""
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </header>

      {loading && (
        <div className="flex justify-center my-4">
          <Loader />
        </div>
      )}

      <main className="flex h-full flex-col md:flex-row w-full">
        <aside
          className={`${
            selectedEmail?.emailId
              ? "hidden md:block md:w-[500px]"
              : "block w-full"
          }  pr-3 pb-4 overflow-hidden transition-all duration-300 border-r border-gray-200`}
        >
          {filteredEmails.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p>No emails found.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Suspense fallback={<Loader />}>
                {filteredEmails.map((email) => (
                  <div
                    key={email.emailId}
                    className={`p-4 flex h-auto gap-4 rounded-lg cursor-pointer shadow-md transition-all duration-200 ${
                      email.isRead ? "bg-gray-100" : "bg-white"
                    } && ${
                      selectedEmail?.emailId === email.emailId
                        ? "border-2 border-red-500"
                        : ""
                    }`}
                    onClick={() => handleEmailSelect(email)}
                  >
                    <div className="bg-[#E54065] rounded-full h-12 w-12 flex items-center justify-center text-xl font-semibold text-white">
                      {email.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-grow overflow-hidden flex flex-col gap-1">
                      <p className="font-semibold">
                        {email.name}{" "}
                        <span className="text-base text-gray-500">
                          {email.email}
                        </span>
                      </p>
                      <p className="font-semibold truncate">
                        Subject: {email.subject}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {email.body}
                      </p>
                      <div className="flex justify-start gap-4 items-center text-sm">
                        <p>{formatDate(email.createdAt)}</p>
                        {email.isFavorite && (
                          <span className="text-[#E54065] font-semibold">
                            Favorite
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </Suspense>

              {dataLength > 5 && (
                <footer className="flex justify-center items-center rounded-full gap-3 mt-4">
                  <button
                    className={`px-3 py-2 rounded ${
                      currentPage === 1
                        ? "bg-red-300 text-gray-500 cursor-not-allowed"
                        : "bg-red-200"
                    }`}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <p>
                    Page {currentPage} of {totalPages}
                  </p>
                  <button
                    className={`px-3 py-2 rounded ${
                      currentPage === totalPages
                        ? "bg-red-300 text-gray-500 cursor-not-allowed"
                        : "bg-red-200"
                    }`}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </footer>
              )}
            </div>
          )}
        </aside>

        {selectedEmail && (
          <div className="w-[95%] block h-5/6 pb-4 overflow-y-auto pt-4 p-4 bg-white rounded-lg shadow-md">
            {bodyloading ? <Loader /> : <EmailBody />}
          </div>
        )}
      </main>
    </>
  );
};

export default EmailList;
